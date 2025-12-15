const mongoose = require('mongoose');

/**
 * Agendamento Schema
 * Represents an identity document appointment booking
 */
const agendamentoSchema = new mongoose.Schema(
  {
    // Client Information
    nomeCliente: {
      type: String,
      required: [true, 'Nome do cliente é obrigatório'],
      trim: true,
      minlength: [3, 'Nome deve ter pelo menos 3 caracteres'],
      maxlength: [100, 'Nome não pode exceder 100 caracteres']
    },

    email: {
      type: String,
      required: [true, 'Email é obrigatório'],
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Email inválido'
      ]
    },

    telefone: {
      type: String,
      required: [true, 'Telefone é obrigatório'],
      trim: true,
      match: [/^\d{10,11}$/, 'Telefone deve conter 10 ou 11 dígitos']
    },

    documento: {
      type: String,
      trim: true,
      default: null
    },

    // Appointment Details
    tipoServico: {
      type: String,
      required: [true, 'Tipo de serviço é obrigatório'],
      enum: [
        'Emissão de RG',
        'Renovação de RG',
        'Alteração de Dados',
        'Duplicata de RG',
        'Consulta'
      ]
    },

    dataAgendamento: {
      type: Date,
      required: [true, 'Data do agendamento é obrigatória'],
      validate: {
        validator: function(v) {
          return v > new Date();
        },
        message: 'Data do agendamento não pode ser no passado'
      }
    },

    horaAgendamento: {
      type: String,
      required: [true, 'Hora do agendamento é obrigatória'],
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Hora deve estar no formato HH:mm']
    },

    status: {
      type: String,
      enum: ['pendente', 'confirmado', 'concluído', 'cancelado'],
      default: 'pendente'
    },

    observacoes: {
      type: String,
      trim: true,
      default: '',
      maxlength: [1000, 'Observações não podem exceder 1000 caracteres']
    },

    // Metadata
    dataCriacao: {
      type: Date,
      default: Date.now,
      immutable: true
    },

    dataAtualizacao: {
      type: Date,
      default: Date.now
    },

    canceladoEm: {
      type: Date,
      default: null
    },

    motivoCancelamento: {
      type: String,
      trim: true,
      default: null
    }
  },
  {
    timestamps: true,
    collection: 'agendamentos'
  }
);

// Indexes for better query performance
agendamentoSchema.index({ email: 1 });
agendamentoSchema.index({ telefone: 1 });
agendamentoSchema.index({ dataAgendamento: 1 });
agendamentoSchema.index({ status: 1 });
agendamentoSchema.index({ nomeCliente: 'text', email: 'text' });

// Pre-save middleware to update dataAtualizacao
agendamentoSchema.pre('save', function(next) {
  this.dataAtualizacao = new Date();
  next();
});

// Instance method to cancel an appointment
agendamentoSchema.methods.cancelar = function(motivo = '') {
  this.status = 'cancelado';
  this.canceladoEm = new Date();
  this.motivoCancelamento = motivo;
  return this.save();
};

// Instance method to confirm an appointment
agendamentoSchema.methods.confirmar = function() {
  if (this.status !== 'pendente') {
    throw new Error('Apenas agendamentos pendentes podem ser confirmados');
  }
  this.status = 'confirmado';
  return this.save();
};

// Static method to find appointments by status
agendamentoSchema.statics.findByStatus = function(status) {
  return this.find({ status });
};

// Static method to find upcoming appointments
agendamentoSchema.statics.findUpcoming = function(days = 7) {
  const now = new Date();
  const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  
  return this.find({
    dataAgendamento: {
      $gte: now,
      $lte: futureDate
    },
    status: { $ne: 'cancelado' }
  });
};

// Create and export the model
const Agendamento = mongoose.model('Agendamento', agendamentoSchema);

module.exports = Agendamento;