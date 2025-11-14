// src/components/Grid.js
import React, { useState } from "react";
import styled from "styled-components";
import axios from "axios";
import { FaTrash, FaEdit, FaQrcode } from "react-icons/fa";
import { toast } from "react-toastify";
import { QRCodeCanvas } from "qrcode.react";

// === ESTILOS ===
const Container = styled.div`
  max-width: 1200px;
  margin: 40px auto;
  padding: 0 20px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
`;

const Thead = styled.thead`
  background: #2c73d2;
  color: white;
  text-transform: uppercase;
  font-size: 13px;
  letter-spacing: 0.5px;
`;

const Th = styled.th`
  padding: 16px 12px;
  text-align: start;
  @media (max-width: 500px) {
    ${(props) => props.$onlyWeb && "display: none"}
  }
`;

const Tbody = styled.tbody`
  tr {
    border-bottom: 1px solid #eee;
    transition: background 0.2s ease;
    &:hover {
      background: #f8f9fa;
    }
  }
`;

const Tr = styled.tr``;

const Td = styled.td`
  padding: 15px 12px;
  font-size: 14px;
  color: #333;
  text-align: ${(props) => (props.$alignCenter ? "center" : "start")};
  width: ${(props) => props.width || "auto"};

  @media (max-width: 500px) {
    ${(props) => props.$onlyWeb && "display: none"}
    font-size: 13px;
    padding: 10px 8px;
  }
`;

const IconButton = styled.button`
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  margin: 0 6px;
  padding: 6px;
  border-radius: 6px;
  transition: all 0.2s ease;
  color: ${(props) => props.color || "#666"};

  &:hover {
    background: ${(props) =>
      props.color ? "rgba(44, 115, 210, 0.1)" : "#f0f0f0"};
    transform: translateY(-1px);
  }
`;

// === MODAL DE QR CODE ===
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 380px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
`;

const ModalHeader = styled.div`
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
  h3 {
    margin: 0;
    font-size: 18px;
    color: #2c73d2;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #aaa;
  &:hover {
    color: #000;
  }
`;

const ModalBody = styled.div`
  padding: 20px;
  text-align: center;
`;

const QRBoxModal = styled.div`
  background: #f8f9fa;
  padding: 20px;
  border-radius: 12px;
  border: 1px solid #eee;
`;

const KeyInfo = styled.div`
  margin: 16px 0 8px;
  strong {
    display: block;
    font-size: 16px;
    color: #2c73d2;
  }
  p {
    margin: 4px 0 0;
    font-family: monospace;
    font-size: 13px;
    color: #555;
    word-break: break-all;
  }
`;

const DownloadBtn = styled.button`
  margin-top: 12px;
  background: #28a745;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  &:hover {
    background: #218838;
  }
`;

// === FUNÇÃO PIX 100% CORRETA (PADRÃO BC) ===
const pad2 = (n) => n.toString().padStart(2, "0");

const buildField = (id, value = "") => {
  const str = String(value || "");
  return id + pad2(str.length) + str;
};

const crc16 = (data) => {
  let crc = 0xffff;
  for (let i = 0; i < data.length; i++) {
    crc ^= data.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
};

const cleanText = (text) => {
  if (!text) return "";
  return text
    .replace(/[^\w\s]/g, "") // Remove símbolos
    .replace(/\s+/g, " ") // Espaços múltiplos → 1
    .trim()
    .substring(0, 25);
};

const generatePixPayload = ({ key, name, city, txid = "" }) => {
  if (!key) return "";

  const cleanKey = String(key).trim();
  const cleanName = cleanText(name);
  const cleanCity = cleanText(city) || "FORTALEZA";

  const gui = "BR.GOV.BCB.PIX";
  const payload = [
    buildField("00", "01"),
    buildField("26", buildField("00", gui) + buildField("01", cleanKey)),
    buildField("52", "0000"),
    buildField("53", "986"),
    buildField("58", "BR"),
    buildField("59", cleanName),
    buildField("60", cleanCity),
    buildField("62", buildField("05", txid || "CAD000")), // OBRIGATÓRIO
    "6304",
  ].join("");

  return payload + crc16(payload);
};

// === COMPONENTE MODAL ===
const QRModal = ({ isOpen, onClose, user }) => {
  if (!isOpen || !user) return null;

  const pixPayload = generatePixPayload({
    key: user.pix,
    name: user.beneficiario || user.nome,
    city: user.cidade || "FORTALEZA",
  });

  const downloadQR = () => {
    const canvas = document.querySelector("#qrcode-canvas");
    if (canvas) {
      const url = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url;
      a.download = `pix_${user.pix.replace(/[@.]/g, "_")}.png`;
      a.click();
    }
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <h3>QR Code PIX</h3>
          <CloseButton onClick={onClose}>×</CloseButton>
        </ModalHeader>
        <ModalBody>
          <QRBoxModal>
            <QRCodeCanvas
              id="qrcode-canvas"
              value={pixPayload}
              size={200}
              level="H"
              includeMargin
            />
            <KeyInfo>
              <strong>{user.beneficiario || user.nome}</strong>
              <p>{user.pix}</p>
            </KeyInfo>
            <DownloadBtn onClick={downloadQR}>Baixar QR Code</DownloadBtn>
          </QRBoxModal>
        </ModalBody>
      </ModalContent>
    </ModalOverlay>
  );
};

// === COMPONENTE GRID ===
const Grid = ({ users, setUsers, setOnEdit }) => {
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const handleEdit = (item) => {
    setOnEdit(item);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8800/${id}`);
      const newArray = users.filter((user) => user.id !== id);
      setUsers(newArray);
      toast.success("Excluído com sucesso!");
    } catch (error) {
      toast.error("Erro ao excluir.");
    }
    setOnEdit(null);
  };

  return (
    <Container>
      <Table>
        <Thead>
          <Tr>
            <Th>Nome</Th>
            <Th $onlyWeb>Telefone</Th>
            <Th>Pix (chave)</Th>
            <Th width="10%"></Th>
          </Tr>
        </Thead>
        <Tbody>
          {users.map((item, i) => (
            <Tr key={i}>
              <Td width="30%">{item.nome}</Td>
              <Td width="20%" $onlyWeb>
                {item.fone}
              </Td>
              <Td width="30%">{item.pix}</Td>
              <Td $alignCenter width="10%">
                <IconButton onClick={() => handleEdit(item)}>
                  <FaEdit />
                </IconButton>
                <IconButton
                  onClick={() => handleDelete(item.id)}
                  color="#e74c3c"
                >
                  <FaTrash />
                </IconButton>
                <IconButton
                  onClick={() => {
                    setSelectedUser(item);
                    setQrModalOpen(true);
                  }}
                  color="#2c73d2"
                >
                  <FaQrcode />
                </IconButton>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      {/* MODAL DE QR CODE */}
      <QRModal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        user={selectedUser}
      />
    </Container>
  );
};

export default Grid;
