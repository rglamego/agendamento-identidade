import React, { useState, useEffect } from 'react';
import './ListaAgendamentos.css';

const ListaAgendamentos = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    filterAppointments();
  }, [appointments, searchTerm, filterStatus]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/agendamentos');
      if (!response.ok) {
        throw new Error('Falha ao carregar agendamentos');
      }
      const data = await response.json();
      setAppointments(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const filterAppointments = () => {
    let filtered = appointments;

    // Filter by search term (name, email, phone, document)
    if (searchTerm) {
      filtered = filtered.filter(app =>
        app.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.telefone?.includes(searchTerm) ||
        app.documento?.includes(searchTerm)
      );
    }

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(app => app.status === filterStatus);
    }

    // Sort by date descending
    filtered.sort((a, b) => new Date(b.data) - new Date(a.data));

    setFilteredAppointments(filtered);
    setCurrentPage(1);
  };

  const formatDate = (dateString) => {
    const options = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'UTC'
    };
    return new Date(dateString).toLocaleString('pt-BR', options);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'confirmado':
        return 'badge-success';
      case 'pendente':
        return 'badge-warning';
      case 'cancelado':
        return 'badge-danger';
      case 'concluído':
        return 'badge-info';
      default:
        return 'badge-secondary';
    }
  };

  const getStatusLabel = (status) => {
    const statusMap = {
      confirmado: 'Confirmado',
      pendente: 'Pendente',
      cancelado: 'Cancelado',
      concluído: 'Concluído',
    };
    return statusMap[status] || status;
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAppointments.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleRefresh = () => {
    fetchAppointments();
  };

  if (loading) {
    return (
      <div className="lista-agendamentos">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Carregando agendamentos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="lista-agendamentos">
      <div className="header-section">
        <h1>Agendamentos</h1>
        <button className="btn-refresh" onClick={handleRefresh} title="Atualizar lista">
          ↻ Atualizar
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          <strong>Erro:</strong> {error}
        </div>
      )}

      <div className="filters-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="Buscar por nome, email, telefone ou documento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-status">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="status-select"
          >
            <option value="all">Todos os Status</option>
            <option value="pendente">Pendente</option>
            <option value="confirmado">Confirmado</option>
            <option value="concluído">Concluído</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>
      </div>

      <div className="stats-section">
        <div className="stat-item">
          <span className="stat-label">Total:</span>
          <span className="stat-value">{filteredAppointments.length}</span>
        </div>
      </div>

      {filteredAppointments.length === 0 ? (
        <div className="empty-state">
          <p>Nenhum agendamento encontrado.</p>
        </div>
      ) : (
        <>
          <div className="table-container">
            <table className="appointments-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Documento</th>
                  <th>Email</th>
                  <th>Telefone</th>
                  <th>Data e Hora</th>
                  <th>Status</th>
                  <th>Tipo de Serviço</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((appointment) => (
                  <tr key={appointment.id} className="appointment-row">
                    <td className="cell-nome">{appointment.nome}</td>
                    <td className="cell-documento">{appointment.documento}</td>
                    <td className="cell-email">{appointment.email}</td>
                    <td className="cell-telefone">{appointment.telefone}</td>
                    <td className="cell-data">{formatDate(appointment.data)}</td>
                    <td className="cell-status">
                      <span className={`badge ${getStatusBadgeClass(appointment.status)}`}>
                        {getStatusLabel(appointment.status)}
                      </span>
                    </td>
                    <td className="cell-servico">{appointment.tipoServico || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="pagination-section">
              <button
                className="btn-pagination"
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
              >
                ← Anterior
              </button>
              <span className="pagination-info">
                Página {currentPage} de {totalPages}
              </span>
              <button
                className="btn-pagination"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
              >
                Próxima →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ListaAgendamentos;
