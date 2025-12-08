require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();

// --- MUDANÇA 1: Aumentar o limite para aceitar fotos ---
app.use(express.json({ limit: '10mb' })); 
app.use(cors());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Conectado!'))
  .catch(err => console.error('Erro no Mongo:', err));

// --- MODELOS ---
const User = mongoose.model('User', new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, default: 'participant' },
  avatar: String // Caso queira salvar avatar do usuário tbm
}));

const Goal = mongoose.model('Goal', new mongoose.Schema({
  title: String,
  description: String,
  category: String,
  priority: String,
  due_date: String,
  status: { type: String, default: 'nao_iniciado' },
  completed_date: String,
  created_by: String,
  created_at: { type: Date, default: Date.now }
}));

const Marathon = mongoose.model('Marathon', new mongoose.Schema({
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
}));

const MarathonProgress = mongoose.model('MarathonProgress', new mongoose.Schema({
  userId: String,
  marathonId: String,
  tasks: [{
    taskId: String,
    completed: Boolean,
    note: String,
    photo: String // --- MUDANÇA 2: Campo novo para a foto ---
  }]
}));

const Settings = mongoose.model('Settings', new mongoose.Schema({
  snow_enabled: Boolean,
  lights_enabled: Boolean,
  music_enabled: Boolean,
  music_volume: { type: Number, default: 0.5 },
  theme: String
}));

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
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar } });
  } catch { res.status(500).json({ error: 'Erro no servidor' }); }
});

// Atualizar Perfil (Foto de Avatar)
app.put('/api/me', authenticateToken, async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.user._id, req.body, { new: true });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar perfil' });
    }
});

app.get('/api/me', authenticateToken, (req, res) => {
  res.json({ id: req.user._id, name: req.user.name, email: req.user.email, role: req.user.role, avatar: req.user.avatar });
});

// --- ROTAS USUÁRIOS (Para o Ranking mostrar fotos) ---
app.get('/api/users', async (req, res) => {
    const users = await User.find({}, 'name email avatar role'); // Retorna avatar tb
    res.json(users);
});

// --- ROTAS METAS ---
app.get('/api/goals', authenticateToken, async (req, res) => {
    const goals = await Goal.find({ created_by: req.user.email }).sort({ created_at: -1 });
    res.json(goals);
});
// Rota "ADMIN" para pegar todas as metas (para o ranking funcionar corretamente)
app.get('/api/goals/all', async (req, res) => {
    const goals = await Goal.find({});
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
  const marathon = await Marathon.create({ ...req.body, created_by: req.user.email });
  res.json(marathon);
});

app.delete('/api/marathons/:id', async (req, res) => {
  await Marathon.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// --- ROTAS DE PROGRESSO DA MARATONA ---

// 1. Meu Progresso (Lista de todas as maratonas que participo)
app.get('/api/my-progress', authenticateToken, async (req, res) => {
    const progress = await MarathonProgress.find({ userId: req.user._id });
    res.json(progress);
});

// 2. Progresso de Todos (Para o Ranking)
app.get('/api/progress/all', async (req, res) => {
    const progress = await MarathonProgress.find({});
    res.json(progress);
});

// 3. Progresso Específico de uma Maratona
app.get('/api/marathons/:id/progress', authenticateToken, async (req, res) => {
  let progress = await MarathonProgress.findOne({ userId: req.user._id, marathonId: req.params.id });
  if (!progress) {
    progress = { userId: req.user._id, marathonId: req.params.id, tasks: [] };
  }
  res.json(progress);
});

// 4. Inscrever-se em uma maratona
app.post('/api/marathons/:id/subscribe', authenticateToken, async (req, res) => {
    const marathonId = req.params.id;
    const userId = req.user._id;
    
    let progress = await MarathonProgress.findOne({ userId, marathonId });
    if (!progress) {
        progress = await MarathonProgress.create({ userId, marathonId, tasks: [] });
    }
    res.json(progress);
});

// 5. Atualizar Tarefa (Check, Nota e Foto)
app.post('/api/marathons/:id/task', authenticateToken, async (req, res) => {
  // --- MUDANÇA 3: Receber photo do body ---
  const { taskId, completed, note, photo } = req.body;
  const marathonId = req.params.id;
  const userId = req.user._id;

  let progress = await MarathonProgress.findOne({ userId, marathonId });
  if (!progress) {
    progress = await MarathonProgress.create({ userId, marathonId, tasks: [] });
  }

  const taskIndex = progress.tasks.findIndex(t => t.taskId === taskId);
  if (taskIndex > -1) {
    // Atualiza existente
    if (completed !== undefined) progress.tasks[taskIndex].completed = completed;
    if (note !== undefined) progress.tasks[taskIndex].note = note;
    if (photo !== undefined) progress.tasks[taskIndex].photo = photo; // Atualiza a foto se vier
  } else {
    // Cria novo registro de tarefa
    progress.tasks.push({ 
        taskId, 
        completed: completed || false, 
        note: note || '',
        photo: photo || '' // Salva a foto
    });
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

module.exports = app;

if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
}