import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Conectado!'))
  .catch(err => console.error('Erro no Mongo:', err));

// --- MODELOS ---
const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, default: 'participant' }
});
// Evita erro de re-compilação do modelo na Vercel
const User = mongoose.models.User || mongoose.model('User', UserSchema);

const GoalSchema = new mongoose.Schema({
  title: String,
  description: String,
  category: String,
  priority: String,
  due_date: String,
  status: { type: String, default: 'nao_iniciado' },
  completed_date: String,
  created_by: String,
  created_by_name: String,
  created_at: { type: Date, default: Date.now }
});
const Goal = mongoose.models.Goal || mongoose.model('Goal', GoalSchema);

const MarathonSchema = new mongoose.Schema({
  name: String,
  description: String,
  type: String,
  start_date: String,
  end_date: String,
  rounds: [{
    id: String,
    title: String,
    tasks: [{
      id: String,
      text: String
    }]
  }],
  created_by: String,
  created_at: { type: Date, default: Date.now }
});
const Marathon = mongoose.models.Marathon || mongoose.model('Marathon', MarathonSchema);

const MarathonProgressSchema = new mongoose.Schema({
  userId: String,
  marathonId: String,
  tasks: [{
    taskId: String,
    completed: Boolean,
    note: String
  }]
});
const MarathonProgress = mongoose.models.MarathonProgress || mongoose.model('MarathonProgress', MarathonProgressSchema);

const SettingsSchema = new mongoose.Schema({
  snow_enabled: Boolean,
  lights_enabled: Boolean,
  music_enabled: Boolean,
  music_volume: { type: Number, default: 0.5 },
  theme: String
});
const Settings = mongoose.models.Settings || mongoose.model('Settings', SettingsSchema);

// --- MIDDLEWARE ---
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Acesso negado' });

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) return res.status(403).json({ error: 'Token inválido' });
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
    req.user = user;
    next();
  });
};


// ROTA NOVA: Listar usuários para o Ranking
app.get('/api/users', async (req, res) => {
  const users = await User.find().select('name email role');
  res.json(users);
});

// ROTA NOVA: Pegar o progresso de TODO MUNDO para o Ranking
app.get('/api/progress/all', async (req, res) => {
  const allProgress = await MarathonProgress.find();
  res.json(allProgress);
});

// --- PROGRESSO DA MARATONA ---

// ROTA NOVA: Pega todo o progresso do usuário (para saber em quais ele está inscrito)
app.get('/api/my-progress', authenticateToken, async (req, res) => {
  const allProgress = await MarathonProgress.find({ userId: req.user._id });
  res.json(allProgress);
});

// ROTA NOVA: Inscrever-se em uma maratona
app.post('/api/marathons/:id/subscribe', authenticateToken, async (req, res) => {
  const marathonId = req.params.id;
  const userId = req.user._id;

  // Verifica se já existe
  const existing = await MarathonProgress.findOne({ userId, marathonId });
  if (existing) return res.json(existing);

  // Cria a inscrição vazia
  const newProgress = await MarathonProgress.create({ userId, marathonId, tasks: [] });
  res.json(newProgress);
});

// --- ROTAS AUTH ---
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({ name, email, password: hashedPassword });
    res.json({ message: 'Usuário criado!' });
  } catch { res.status(400).json({ error: 'Erro ao criar' }); }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ error: 'Erro de login' });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch { res.status(500).json({ error: 'Erro no servidor' }); }
});

app.get('/api/me', authenticateToken, (req, res) => {
  res.json({ id: req.user._id, name: req.user.name, email: req.user.email, role: req.user.role });
});

// --- ROTAS METAS ---
app.get('/api/goals', authenticateToken, async (req, res) => {
  const goals = await Goal.find({ created_by: req.user.email }).sort({ created_at: -1 });
  res.json(goals);
});
app.post('/api/goals', authenticateToken, async (req, res) => {
  const goal = await Goal.create({ ...req.body, created_by: req.user.email });
  res.json(goal);
});
app.put('/api/goals/:id', async (req, res) => {
  const goal = await Goal.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(goal);
});
app.delete('/api/goals/:id', async (req, res) => {
  await Goal.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// --- ROTAS MARATONAS ---
app.get('/api/marathons', async (req, res) => {
  const marathons = await Marathon.find().sort({ created_at: -1 });
  res.json(marathons);
});

app.post('/api/marathons', authenticateToken, async (req, res) => {
  const marathon = await Marathon.create({ ...req.body, created_by: req.user.email, created_by_name: req.user.name });
  res.json(marathon);
});

app.delete('/api/marathons/:id', async (req, res) => {
  await Marathon.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// --- PROGRESSO DA MARATONA ---
app.get('/api/marathons/:id/progress', authenticateToken, async (req, res) => {
  let progress = await MarathonProgress.findOne({ userId: req.user._id, marathonId: req.params.id });
  if (!progress) {
    progress = { userId: req.user._id, marathonId: req.params.id, tasks: [] };
  }
  res.json(progress);
});

app.post('/api/marathons/:id/task', authenticateToken, async (req, res) => {
  const { taskId, completed, note } = req.body;
  const marathonId = req.params.id;
  const userId = req.user._id;

  let progress = await MarathonProgress.findOne({ userId, marathonId });
  if (!progress) {
    progress = await MarathonProgress.create({ userId, marathonId, tasks: [] });
  }

  const taskIndex = progress.tasks.findIndex(t => t.taskId === taskId);
  if (taskIndex > -1) {
    if (completed !== undefined) progress.tasks[taskIndex].completed = completed;
    if (note !== undefined) progress.tasks[taskIndex].note = note;
  } else {
    progress.tasks.push({ taskId, completed: completed || false, note: note || '' });
  }

  await progress.save();
  res.json(progress);
});

// --- SETTINGS ---
app.get('/api/settings', async (req, res) => {
  const s = await Settings.findOne();
  res.json(s ? [s] : [{ snow_enabled: true }]);
});
app.post('/api/settings', async (req, res) => {
  await Settings.deleteMany({});
  const s = await Settings.create(req.body);
  res.json(s);
});
app.put('/api/settings/:id', async (req, res) => {
    try {
        const s = await Settings.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(s);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao salvar configurações' });
    }
});

// --- EXPORTAÇÃO PARA VERCEL (MUDANÇA CRUCIAL) ---
export default app;

// Só roda localmente se o arquivo for chamado diretamente
// (Essa verificação muda um pouco em ES Modules, mas para Vercel o export default basta)
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  // Verifica se não estamos no ambiente serverless antes de tentar ouvir a porta
  // Para simplificar e evitar erros no Vercel, podemos remover o listen automático
  // ou deixá-lo apenas para o seu comando 'npm run server' local.
  // app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
}