require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();

// Aumentei o limite para aceitar fotos de perfil maiores se necessário
app.use(express.json({ limit: '10mb' })); 
app.use(cors());

// --- CONEXÃO COM BANCO DE DADOS ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Conectado! (Modo Sprint)'))
  .catch(err => console.error('Erro no Mongo:', err));

// --- MODELOS (SCHEMAS) ---

// 1. Usuário (Login e Perfil)
const User = mongoose.model('User', new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  avatar: String, // URL da foto
  role: { type: String, default: 'participant' },
  createdAt: { type: Date, default: Date.now }
}));

// 2. Sprint (Registro de Horas)
const Sprint = mongoose.model('Sprint', new mongoose.Schema({
  userId: { type: String, required: true }, // Vínculo com o usuário
  topic: String,         // O que estudou
  duration: Number,      // Duração em segundos (para cálculos)
  totalDuration: String, // Texto formatado (ex: "01:30:00")
  date: String,          // Data YYYY-MM-DD
  startTime: String,     // Hora inicio
  endTime: String,       // Hora fim
  createdAt: { type: Date, default: Date.now }
}));

// --- MIDDLEWARE DE SEGURANÇA ---
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

// ==========================================
//                 ROTAS
// ==========================================

// --- 1. AUTENTICAÇÃO E PERFIL ---

// Registro
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    // Verifica se já existe
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email já cadastrado' });

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({ name, email, password: hashedPassword });
    res.json({ message: 'Usuário criado com sucesso!' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar conta' });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ error: 'Credenciais inválidas' });
    }
    
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    
    // Retorna dados do usuário para o frontend
    res.json({ 
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        avatar: user.avatar,
        role: user.role 
      } 
    });
  } catch (err) {
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

// Pegar Perfil Atual (Me)
app.get('/api/me', authenticateToken, (req, res) => {
  res.json({
    id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    avatar: req.user.avatar,
    role: req.user.role
  });
});

// Atualizar Perfil (Foto, Nome, Email) - Usado na página Settings
app.put('/api/me', authenticateToken, async (req, res) => {
    try {
        const { name, email, avatar } = req.body;
        
        // Atualiza apenas os campos enviados
        const updateData = {};
        if (name) updateData.name = name;
        if (email) updateData.email = email;
        if (avatar) updateData.avatar = avatar;

        const user = await User.findByIdAndUpdate(req.user._id, updateData, { new: true });
        
        res.json({
            id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            role: user.role
        });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar perfil' });
    }
});

// Listar todos usuários (Para o Ranking na Lista.jsx)
app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find({}, 'name email avatar role');
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: 'Erro ao listar usuários' });
    }
});


// --- 2. SPRINTS (SALVAR HORAS) ---

// Salvar um novo Sprint
app.post('/api/sprints', authenticateToken, async (req, res) => {
  try {
    const { topic, duration, totalDuration, date, startTime, endTime } = req.body;
    
    const sprint = await Sprint.create({
      userId: req.user._id, // Salva com o ID de quem está logado
      topic,
      duration,
      totalDuration,
      date,
      startTime,
      endTime
    });

    res.json(sprint);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao salvar sprint mágico' });
  }
});

// Listar Sprints (Histórico do Usuário Logado)
app.get('/api/sprints', authenticateToken, async (req, res) => {
  try {
    // Busca apenas os sprints do usuário logado, ordenado do mais novo para o mais antigo
    const sprints = await Sprint.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(sprints);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar grimório' });
  }
});

// Apagar um Sprint
app.delete('/api/sprints/:id', authenticateToken, async (req, res) => {
  try {
    // Garante que só pode apagar se o sprint for do próprio usuário
    const result = await Sprint.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!result) return res.status(404).json({ error: 'Registro não encontrado ou sem permissão' });
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao apagar registro' });
  }
});

// Rota para pegar TODOS os Sprints (Para calcular o Ranking Geral Global)
// Usado na Lista.jsx para somar pontos
app.get('/api/sprints/all', async (req, res) => {
    try {
        const sprints = await Sprint.find({});
        res.json(sprints);
    } catch (err) {
        res.status(500).json({ error: 'Erro ao buscar ranking global' });
    }
});


module.exports = app;

if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`🔮 Servidor Mágico rodando na porta ${PORT}`));
}