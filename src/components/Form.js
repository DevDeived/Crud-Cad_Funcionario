// src/components/Form.js
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { QRCodeCanvas } from "qrcode.react";
import axios from "axios";
import { toast } from "react-toastify";

const formatDate = (isoDate) => {
  if (!isoDate) return "";
  return isoDate.split("T")[0]; // remove horário
};
// === ESTILOS ===
const FormContainer = styled.form`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  background: #ffffff;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  align-items: flex-end;
  max-width: 1200px;
  margin: 0 auto;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 160px;
  @media (max-width: 768px) { min-width: 140px; }
`;

const Label = styled.label`
  font-size: 13px;
  font-weight: 600;
  color: #444;
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const Input = styled.input`
  padding: 0 12px;
  font-size: 14px;
  height: 44px;
  border: 1.5px solid #ddd;
  border-radius: 8px;
  background-color: #fafafa;
  transition: all 0.2s ease;
  &:focus {
    outline: none;
    border-color: #2c73d2;
    background-color: #fff;
    box-shadow: 0 0 0 3px rgba(44, 115, 210, 0.15);
  }
`;

const SubmitButton = styled.button`
  background: #2c73d2;
  color: white;
  font-weight: 600;
  font-size: 14px;
  padding: 0 24px;
  height: 44px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 100px;
  text-transform: uppercase;
  &:hover {
    background: #1a5bb8;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(44, 115, 210, 0.3);
  }
`;

const QRSection = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
  margin-top: 28px;
`;

const QRBox = styled.div`
  background: #f8f9fa;
  padding: 20px;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  border: 1px solid #eee;
  max-width: 240px;
`;

const QRTitle = styled.p`
  margin: 0 0 12px;
  font-size: 15px;
  font-weight: 600;
  color: #2c73d2;
`;

const KeyText = styled.p`
  margin: 10px 0 0;
  font-size: 11px;
  color: #666;
  word-break: break-all;
  font-family: monospace;
`;

const DownloadBtn = styled.button`
  margin-top: 12px;
  background: #28a745;
  color: white;
  font-size: 12px;
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  &:hover { background: #218838; }
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
    .replace(/[^\w\s]/g, "")  // Remove símbolos
    .replace(/\s+/g, " ")     // Espaços múltiplos → 1
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

// === COMPONENTE FORM ===
const Form = ({ onEdit, setOnEdit, getUsers }) => {
  const [formData, setFormData] = useState({
    nome: "",
    beneficiario: "",
    cidade: "",
    fone: "",
    data_nascimento: "",
    pix: "",
  });

  useEffect(() => {
  if (onEdit) {
    setFormData({
      nome: onEdit.nome || "",
      beneficiario: onEdit.beneficiario || "",
      cidade: onEdit.cidade || "",
      fone: onEdit.fone || "",
      data_nascimento: onEdit.data_nascimento ? formatDate(onEdit.data_nascimento) : "",
      pix: onEdit.pix || "",
    });
  } else {
    setFormData({
      nome: "",
      beneficiario: "",
      cidade: "",
      fone: "",
      data_nascimento: "",
      pix: "",
    });
  }
}, [onEdit]);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = {
      nome: formData.nome.trim(),
      beneficiario: formData.beneficiario.trim() || formData.nome,
      cidade: formData.cidade.trim() || "FORTALEZA",
      fone: formData.fone.trim() || null,
      data_nascimento: formData.data_nascimento || null,
      pix: formData.pix.trim(),
    };

    if (!data.nome || !data.pix) {
      toast.error("Nome e Pix são obrigatórios!");
      return;
    }

    try {
      if (onEdit) {
        await axios.put(`http://localhost:8800/${onEdit.id}`, data);
        toast.success("Atualizado com sucesso!");
      } else {
        await axios.post("http://localhost:8800", data);
        toast.success("Cadastrado com sucesso!");
      }

      // Limpa formulário
      setFormData({
        nome: "",
        beneficiario: "",
        cidade: "",
        fone: "",
        data_nascimento: "",
        pix: "",
      });
      setOnEdit(null);
      getUsers();
    } catch (error) {
      console.error("Erro ao salvar:", error.response?.data || error);
      toast.error("Erro ao salvar. Verifique o console.");
    }
  };

  const pixPayload = formData.pix
  ? generatePixPayload({
      key: formData.pix.trim(),
      name: (formData.beneficiario || formData.nome || "").trim(),
      city: (formData.cidade || "FORTALEZA").trim(),
      txid: `CAD${Date.now().toString().slice(-6)}`,
    })
  : "";

  const downloadQR = () => {
    const canvas = document.querySelector("canvas");
    if (canvas) {
      const url = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url;
      a.download = `pix_${formData.pix.replace(/[@.]/g, "_")}.png`;
      a.click();
    }
  };

  return (
    <>
      <FormContainer onSubmit={handleSubmit}>
        {/* NOME */}
        <InputGroup>
          <Label>Nome</Label>
          <Input
            name="nome"
            value={formData.nome}
            onChange={handleChange}
            placeholder="João"
            required
          />
        </InputGroup>

        {/* BENEFICIÁRIO */}
        <InputGroup>
          <Label>Beneficiário (nome completo)</Label>
          <Input
            name="beneficiario"
            value={formData.beneficiario}
            onChange={handleChange}
            placeholder="João Silva"
          />
        </InputGroup>

        {/* CIDADE */}
        <InputGroup>
          <Label>Cidade</Label>
          <Input
            name="cidade"
            value={formData.cidade}
            onChange={handleChange}
            placeholder="Fortaleza"
          />
        </InputGroup>

        {/* TELEFONE */}
        <InputGroup>
          <Label>Telefone</Label>
          <Input
            name="fone"
            value={formData.fone}
            onChange={handleChange}
            placeholder="(85) 98765-4321"
          />
        </InputGroup>

        {/* DATA NASCIMENTO */}
        <InputGroup>
          <Label>Data de Nascimento</Label>
          <Input
            name="data_nascimento"
            type="date"
            value={formData.data_nascimento}
            onChange={handleChange}
          />
        </InputGroup>

        {/* PIX */}
        <InputGroup>
          <Label>Pix (chave)</Label>
          <Input
            name="pix"
            value={formData.pix}
            onChange={handleChange}
            placeholder="CPF, e-mail, telefone..."
            required
          />
        </InputGroup>

        {/* BOTÃO */}
        <SubmitButton type="submit">
          {onEdit ? "ATUALIZAR" : "SALVAR"}
        </SubmitButton>
      </FormContainer>

      {/* QR CODE */}
      {formData.pix && pixPayload.startsWith("000201") && (
        <QRSection>
          <QRBox>
            <QRTitle>QR Code PIX</QRTitle>
            <QRCodeCanvas value={pixPayload} size={160} level="M" includeMargin />
            <KeyText>{formData.pix}</KeyText>
            <DownloadBtn onClick={downloadQR}>Baixar PNG</DownloadBtn>
          </QRBox>
        </QRSection>
      )}
    </>
  );
};

export default Form;