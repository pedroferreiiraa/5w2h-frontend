import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'tailwindcss/tailwind.css';
import { FaSearch } from 'react-icons/fa';

interface Project {
    id: string;
    title: string;
    projectNumber: number;
    status: number;
    originDate: string;
    isDeleted: boolean;  // Propriedade isDeleted para controle de exclusão
}

const ListProjects: React.FC = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [statusFilter, setStatusFilter] = useState<number>(-1); // -1 significa "Todos"
    const navigate = useNavigate();

    // Função para definir as classes de cor com base no status
    const getStatusColor = (status: number) => {
        switch (status) {
            case 0:
                return "bg-blue-500 text-white";  // Criado - Azul
            case 1:
                return "bg-yellow-500 text-white"; // Em Andamento - Amarelo
            case 2:
                return "bg-gray-500 text-white";   // Suspenso - Cinza
            case 3:
                return "bg-red-500 text-white";    // Cancelado - Vermelho
            case 4:
                return "bg-green-500 text-white";  // Concluído - Verde
            default:
                return "bg-gray-300 text-black";   // Padrão para "Todos" ou indefinido - Cinza claro
        }
    };

    const getStatusText = (status: number): string => {
        switch (status) {
            case 0:
                return 'Criado';
            case 1:
                return 'Em Andamento';
            case 2:
                return 'Suspenso';
            case 3:
                return 'Cancelado';
            case 4:
                return 'Concluído';
            default:
                return 'Desconhecido';
        }
    };

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                setLoading(true);
                setError('');

                const url = `http://localhost:5000/api/projects?search=${searchTerm}&pageNumber=${pageNumber}&pageSize=100&status=${statusFilter}`;

                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });

                if (!response.ok) {
                    throw new Error('Nenhum projeto encontrado para o filtro selecionado');
                }

                const data = await response.json();

                // Verificar se data.data é uma lista válida
                if (!Array.isArray(data.data)) {
                    throw new Error('Formato de dados inesperado recebido da API.');
                }

                // Aplicar a lógica de filtragem para excluir projetos deletados
                const filteredProjects = data.data.filter((project: Project) => !project.isDeleted);

                if (filteredProjects.length === 0) {
                    setError('Nenhum projeto encontrado para o filtro selecionado.');
                }

                // Ordenar projetos para que o último inserido apareça primeiro
                const sortedProjects = filteredProjects.sort((a: { createdAt: string | number | Date; }, b: { createdAt: string | number | Date; }) => {
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                });

                setProjects(sortedProjects);
                setTotalPages(Math.ceil(filteredProjects.length / 10));
            } catch (error: any) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, [searchTerm, pageNumber, statusFilter]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPageNumber(1);
    };

    const handlePreviousPage = () => {
        if (pageNumber > 1) {
            setPageNumber(pageNumber - 1);
        }
    };

    const handleNextPage = () => {
        if (pageNumber < totalPages) {
            setPageNumber(pageNumber + 1);
        }
    };

    const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setStatusFilter(parseInt(e.target.value));
        setPageNumber(1);
    };

    return (
        <div className="p-8 max-w-4xl mx-auto bg-gray-50 min-h-screen">
        {/* Botão Adicionar Projeto */}
        <div className="flex justify-start mb-6">
          <button
            onClick={() => navigate("/adicionar-projeto")}
            className="bg-blue-600 text-white px-5 py-3 rounded-lg shadow hover:bg-blue-700 focus:outline-none transition-all"
          >
            Adicionar Projeto
          </button>
        </div>
      
        {/* Formulário de Busca */}
        <form onSubmit={handleSearch} className="flex items-center mb-8">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            placeholder="Buscar projetos..."
          />
          <button
            type="submit"
            className="ml-3 p-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 focus:outline-none transition-all"
          >
            <FaSearch />
          </button>
        </form>
      
        {/* Filtro por Status */}
        <div className="mb-6">
          <label htmlFor="statusFilter" className="block text-sm font-semibold text-gray-700 mb-3">
            Filtrar por Status
          </label>
          <select
            id="statusFilter"
            value={statusFilter}
            onChange={handleStatusFilterChange}
            className="w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          >
            <option value={-1}>Todos</option>
            <option value={0}>Criado</option>
            <option value={1}>Em Andamento</option>
            <option value={4}>Concluído</option>
          </select>
        </div>
      
        {/* Loading Spinner */}
        {loading ? (
          <div className="flex justify-center mb-6">
            <div className="w-10 h-10 border-4 border-blue-500 border-dotted rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="text-red-500 text-center mb-6">{error}</div>
        ) : (
          <div className="bg-white p-6 rounded-lg shadow-lg">
            {/* Lista de Projetos */}
            <ul>
              {projects.length === 0 ? (
                <li className="text-gray-500 text-center">Nenhum projeto encontrado.</li>
              ) : (
                projects.slice((pageNumber - 1) * 10, pageNumber * 10).map((project) => (
                  <li key={project.id} className="py-4 border-b last:border-b-0">
                    <div className="md:flex md:justify-between md:items-center">
                      <div className="flex items-center">
                        <span className="font-semibold text-lg text-gray-800">{project.title}</span>
                        <span
                          className={`inline-block px-3 py-1 text-sm font-semibold rounded-lg ml-3 ${getStatusColor(
                            project.status
                          )}`}
                        >
                          {getStatusText(project.status)}
                        </span>
                      </div>
                      <button
                        onClick={() => navigate(`/projeto/${project.id}`)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 focus:outline-none transition-all mt-3 md:mt-0 md:ml-4"
                      >
                        Ver Detalhes
                      </button>
                    </div>
                  </li>
                ))
              )}
            </ul>
      
            {/* Paginação */}
            <div className="flex justify-between items-center mt-6">
              <button
                onClick={handlePreviousPage}
                disabled={pageNumber === 1}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg shadow disabled:opacity-50 focus:outline-none hover:bg-gray-400 transition-all"
              >
                Página Anterior
              </button>
              <span className="text-sm text-gray-600">
                Página {pageNumber} de {totalPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={pageNumber === totalPages}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg shadow disabled:opacity-50 focus:outline-none hover:bg-gray-400 transition-all"
              >
                Próxima Página
              </button>
            </div>
          </div>
        )}
      </div>
      
    );
};

export default ListProjects;
