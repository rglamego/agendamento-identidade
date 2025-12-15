import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CriarAgendamento.css';

const CriarAgendamento = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nomeCliente: '',
    email: '',
    telefone: '',
    tipoServi: '',
    dataAgendamento: '',
    horaAgendamento: '',
    observacoes: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const tiposServico = [
    'Emissão de RG',
    'Renovação de RG',
    'Alteração de Dados',
    'Duplicata de RG',
    'Consulta',
  ];

  useEffect(() => {
    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    setFormData((prev) => ({
      ...prev,
      dataAgendamento: today,
    }));
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const validateForm = () => {
    if (!formData.nomeCliente.trim()) {
      setError('Nome do cliente é obrigatório');
      return false;
    }

    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Email válido é obrigatório');
      return false;
    }

    if (!formData.telefone.trim()) {
      setError('Telefone é obrigatório');
      return false;
    }

    if (!formData.tipoServi) {
      setError('Tipo de serviço é obrigatório');
      return false;
    }

    if (!formData.dataAgendamento) {
      setError('Data do agendamento é obrigatória');
      return false;
    }

    if (!formData.horaAgendamento) {
      setError('Hora do agendamento é obrigatória');
      return false;
    }

    const selectedDate = new Date(formData.dataAgendamento);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      setError('Data do agendamento não pode ser no passado');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/agendamentos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nomeCliente: formData.nomeCliente,
          email: formData.email,
          telefone: formData.telefone,
          tipoServico: formData.tipoServi,
          dataAgendamento: formData.dataAgendamento,
          horaAgendamento: formData.horaAgendamento,
          observacoes: formData.observacoes,
          status: 'pendente',
          dataCriacao: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao criar agendamento');
      }

      const result = await response.json();
      setSuccess('Agendamento criado com sucesso!');

      // Reset form
      setFormData({
        nomeCliente: '',
        email: '',
        telefone: '',
        tipoServi: '',
        dataAgendamento: new Date().toISOString().split('T')[0],
        horaAgendamento: '',
        observacoes: '',
      });

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/agendamentos');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Erro ao criar agendamento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="criar-agendamento-container">
      <div className="criar-agendamento-card">
        <h1>Criar Novo Agendamento</h1>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit} className="agendamento-form">
          <div className="form-group">
            <label htmlFor="nomeCliente">Nome do Cliente *</label>
            <input
              type="text"
              id="nomeCliente"
              name="nomeCliente"
              value={formData.nomeCliente}
              onChange={handleInputChange}
              placeholder="Digite o nome completo"
              disabled={loading}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="email@exemplo.com"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="telefone">Telefone *</label>
              <input
                type="tel"
                id="telefone"
                name="telefone"
                value={formData.telefone}
                onChange={handleInputChange}
                placeholder="(XX) XXXXX-XXXX"
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="tipoServi">Tipo de Serviço *</label>
            <select
              id="tipoServi"
              name="tipoServi"
              value={formData.tipoServi}
              onChange={handleInputChange}
              disabled={loading}
            >
              <option value="">Selecione um serviço</option>
              {tiposServico.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {tipo}
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="dataAgendamento">Data do Agendamento *</label>
              <input
                type="date"
                id="dataAgendamento"
                name="dataAgendamento"
                value={formData.dataAgendamento}
                onChange={handleInputChange}
                disabled={loading}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="form-group">
              <label htmlFor="horaAgendamento">Hora do Agendamento *</label>
              <input
                type="time"
                id="horaAgendamento"
                name="horaAgendamento"
                value={formData.horaAgendamento}
                onChange={handleInputChange}
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="observacoes">Observações</label>
            <textarea
              id="observacoes"
              name="observacoes"
              value={formData.observacoes}
              onChange={handleInputChange}
              placeholder="Adicione observações relevantes (opcional)"
              rows="4"
              disabled={loading}
            />
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Criando...' : 'Criar Agendamento'}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/agendamentos')}
              disabled={loading}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CriarAgendamento;
