// src/App.js
import React, { useEffect, useState, useCallback } from "react";
import { createGlobalStyle } from "styled-components";
import styled from "styled-components";
import Form from "./components/Form";
import Grid from "./components/Grid";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    font-family: 'Poppins', sans-serif;
    background-color: #f5f5f5;
  }
`;

const Container = styled.div`
  width: 100%;
  max-width: 1400px;
  margin: 20px auto;
  padding: 0 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
`;

const Header = styled.div`
  width: 100%;
  max-width: 1200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
`;

const Title = styled.h2`
  width: 100%;
  max-width: 1200px;
  text-align: center;
  color: #2c73d2;
  font-weight: 700;
  font-size: 28px;
  margin: 0;
  padding: 10px 0;
  border-bottom: 3px solid #2c73d2;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const SearchContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 400px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px 40px 12px 16px;
  font-size: 15px;
  border: 2px solid #ddd;
  border-radius: 12px;
  background-color: #fafafa;
  transition: all 0.2s ease;
  outline: none;

  &:focus {
    border-color: #2c73d2;
    background-color: #fff;
    box-shadow: 0 0 0 3px rgba(44, 115, 210, 0.15);
  }

  &::placeholder {
    color: #aaa;
  }
`;

const SearchIcon = styled.span`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #2c73d2;
  font-weight: bold;
  pointer-events: none;
`;

function App() {
  const [users, setUsers] = useState([]);
  const [onEdit, setOnEdit] = useState(null);
  const [searchTerm, setSearchTerm] = useState(""); // PESQUISA

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8800";

  const getUsers = useCallback(async () => {
  try {
    const res = await axios.get(API_URL);
    const sorted = res.data.sort((a, b) => a.nome.localeCompare(b.nome));
    setUsers(sorted);
  } catch (error) {
    toast.error("Erro ao carregar funcionários.");
  }
}, [API_URL]);

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  const filteredUsers = users.filter(user =>
    user.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <GlobalStyle />
      <Container>
        <Header>
          <Title>CADASTRO DE FUNCIONÁRIOS</Title>
          <SearchContainer>
            <SearchInput
              type="text"
              placeholder="Pesquisar funcionário..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <SearchIcon>Search</SearchIcon>
          </SearchContainer>
        </Header>

        <Form onEdit={onEdit} setOnEdit={setOnEdit} getUsers={getUsers} />

        <Grid users={filteredUsers} setUsers={setUsers} setOnEdit={setOnEdit} />

        <ToastContainer
          position="bottom-left"
          autoClose={3000}
          theme="colored"
        />
      </Container>
    </>
  );
}

export default App;