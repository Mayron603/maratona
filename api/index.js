import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const app = express();

// Aumenta o limite para aceitar fotos (Vercel limita o payload a 4.5MB, então 10MB aqui é seguro para o Express)
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
  avatar: String
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
    photo: String // Campo da foto garantido no Schema
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

app.get('/api/me', authenticateToken, (req, res) => {
  res.json({ id: req.user._id, name: req.user.name, email: req.user.email, role: req.user.role, avatar: req.user.avatar });
});

app.put('/api/me', authenticateToken, async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.user._id, req.body, { new: true });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar perfil' });
    }
});

app.get('/api/users', async (req, res) => {
    const users = await User.find({}, 'name email avatar role');
    res.json(users);
});

// --- ROTAS METAS ---
app.get('/api/goals', authenticateToken, async (req, res) => {
  const goals = await Goal.find({ created_by: req.user.email }).sort({ created_at: -1 });
  res.json(goals);
});
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

// --- ROTAS PROGRESSO ---
app.get('/api/my-progress', authenticateToken, async (req, res) => {
    const progress = await MarathonProgress.find({ userId: req.user._id });
    res.json(progress);
});

app.get('/api/progress/all', async (req, res) => {
    const progress = await MarathonProgress.find({});
    res.json(progress);
});

app.get('/api/marathons/:id/progress', authenticateToken, async (req, res) => {
  let progress = await MarathonProgress.findOne({ userId: req.user._id, marathonId: req.params.id });
  if (!progress) {
    progress = { userId: req.user._id, marathonId: req.params.id, tasks: [] };
  }
  res.json(progress);
});

app.post('/api/marathons/:id/subscribe', authenticateToken, async (req, res) => {
    const marathonId = req.params.id;
    const userId = req.user._id;
    
    let progress = await MarathonProgress.findOne({ userId, marathonId });
    if (!progress) {
        progress = await MarathonProgress.create({ userId, marathonId, tasks: [] });
    }
    res.json(progress);
});

// ROTA DA FOTO
app.post('/api/marathons/:id/task', authenticateToken, async (req, res) => {
  const { taskId, completed, note, photo } = req.body;
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
    if (photo !== undefined) progress.tasks[taskIndex].photo = photo;
  } else {
    progress.tasks.push({ 
        taskId, 
        completed: completed || false, 
        note: note || '',
        photo: photo || ''
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

// Exporta o app para a Vercel
export default app;

// Inicia servidor apenas se rodado localmente (equivalente a require.main === module em ESM)
import { fileURLToPath } from 'url';
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
}