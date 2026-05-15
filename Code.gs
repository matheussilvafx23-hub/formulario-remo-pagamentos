/**
 * GOOGLE APPS SCRIPT - FORMULÁRIO REMO
 * 
 * Este script processa o formulário de solicitação de pagamento:
 * 1. Recebe os dados via POST
 * 2. Salva os PDFs no Google Drive
 * 3. Adiciona uma nova linha no Google Sheets com os dados + links dos PDFs
 * 
 * CONFIGURAÇÃO:
 * - ID da Planilha: 1vDqHNK1OJneoFpQ5VQK7iLAkrkbnrBHixtDgHOiGifo
 * - Nome da Aba: FORMULÁRIO/PAGAMENTO
 * - ID da Pasta Drive: 17QvZYIrkmJiuID5KqTxGY60xs3mK1H-p
 */

// CONFIGURAÇÕES - NÃO ALTERAR
const CONFIG = {
  SPREADSHEET_ID: '1vDqHNK1OJneoFpQ5VQK7iLAkrkbnrBHixtDgHOiGifo',
  SHEET_NAME: 'FORMULÁRIO/PAGAMENTO',
  FOLDER_ID: '17QvZYIrkmJiuID5KqTxGY60xs3mK1H-p'
};

/**
 * Função principal que recebe o POST do formulário
 */
function doPost(e) {
  try {
    // Parse do JSON recebido
    const data = JSON.parse(e.postData.contents);
    
    // Processar e salvar
    const result = processFormData(data);
    
    // Retornar sucesso
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'Formulário processado com sucesso',
      result: result
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    Logger.log('Erro no doPost: ' + error.toString());
    
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'Erro ao processar formulário: ' + error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Processar dados do formulário
 */
function processFormData(data) {
  // 1. Salvar arquivo(s) no Drive
  const nf1Link = savePDFToDrive(data.nf1, `NF1_${data.creator}_${data.codigoCampanha}`);
  
  let nf2Link = '';
  if (data.nf2) {
    nf2Link = savePDFToDrive(data.nf2, `NF2_${data.creator}_${data.codigoCampanha}`);
  }
  
  // 2. Adicionar linha no Sheets
  const rowData = buildRowData(data, nf1Link, nf2Link);
  addRowToSheet(rowData);
  
  return {
    nf1Link: nf1Link,
    nf2Link: nf2Link
  };
}

/**
 * Salvar PDF no Google Drive
 */
function savePDFToDrive(nfData, fileName) {
  try {
    // Decodificar Base64
    const fileBlob = Utilities.newBlob(
      Utilities.base64Decode(nfData.fileData),
      nfData.mimeType,
      fileName + '.pdf'
    );
    
    // Obter pasta do Drive
    const folder = DriveApp.getFolderById(CONFIG.FOLDER_ID);
    
    // Criar arquivo
    const file = folder.createFile(fileBlob);
    
    // Retornar link de visualização
    return file.getUrl();
    
  } catch (error) {
    Logger.log('Erro ao salvar PDF: ' + error.toString());
    throw new Error('Falha ao salvar PDF no Drive: ' + error.toString());
  }
}

/**
 * Construir array de dados para a linha do Sheets
 * 
 * Mapeamento das colunas:
 * A: (vazio - FORMS)
 * B: (vazio)  
 * C: (vazio)
 * D: Código da Campanha
 * E: Creator
 * F: Quantidade de Nota Fiscal
 * G: Banco Nota Fiscal 1
 * H: Titular Nota Fiscal 1
 * I: Chave PIX Nota Fiscal 1
 * J: Link PDF Nota Fiscal 1
 * K: Banco Nota Fiscal 2
 * L: Titular Nota Fiscal 2
 * M: Chave PIX Nota Fiscal 2
 * N: Link PDF Nota Fiscal 2
 */
function buildRowData(data, nf1Link, nf2Link) {
  const row = [
    '', // A: FORMS
    '', // B: (vazio)
    '', // C: (vazio)
    data.codigoCampanha, // D: Código da Campanha
    data.creator, // E: Creator
    data.quantidadeNF, // F: Quantidade de NF
    data.nf1.banco, // G: Banco NF1
    data.nf1.titular, // H: Titular NF1
    data.nf1.chavePix, // I: Chave PIX NF1
    nf1Link, // J: Link PDF NF1
    data.nf2 ? data.nf2.banco : '', // K: Banco NF2
    data.nf2 ? data.nf2.titular : '', // L: Titular NF2
    data.nf2 ? data.nf2.chavePix : '', // M: Chave PIX NF2
    nf2Link // N: Link PDF NF2
  ];
  
  return row;
}

/**
 * Adicionar linha no Google Sheets
 */
function addRowToSheet(rowData) {
  try {
    // Abrir planilha
    const spreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const sheet = spreadsheet.getSheetByName(CONFIG.SHEET_NAME);
    
    if (!sheet) {
      throw new Error('Aba "' + CONFIG.SHEET_NAME + '" não encontrada');
    }
    
    // Adicionar linha
    sheet.appendRow(rowData);
    
    Logger.log('Linha adicionada com sucesso');
    
  } catch (error) {
    Logger.log('Erro ao adicionar linha: ' + error.toString());
    throw new Error('Falha ao adicionar dados na planilha: ' + error.toString());
  }
}

/**
 * Função de teste - executar manualmente para testar
 */
function testeManual() {
  const dadosTeste = {
    codigoCampanha: 'TESTE123',
    creator: '@testecreator',
    quantidadeNF: '1 Nota Fiscal',
    nf1: {
      banco: 'Banco Teste',
      titular: 'Fulano de Tal',
      chavePix: 'fulano@teste.com',
      fileName: 'teste.pdf',
      fileData: '', // Base64 vazio para teste
      mimeType: 'application/pdf'
    }
  };
  
  try {
    // Testar apenas a adição no Sheets (sem arquivo)
    const rowData = buildRowData(dadosTeste, 'https://drive.google.com/teste1', '');
    addRowToSheet(rowData);
    
    Logger.log('Teste concluído com sucesso!');
    return 'Sucesso! Verifique a planilha.';
    
  } catch (error) {
    Logger.log('Erro no teste: ' + error.toString());
    return 'Erro: ' + error.toString();
  }
}
