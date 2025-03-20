/**
 * Ponto de entrada para categorização de produtos
 */

const path = require('path');
const fs = require('fs');
const { processProductData } = require('./categorizacao');

// Define os arquivos de entrada e saída
const inputFile = process.argv[2] || 'data01.json';
const outputFile = process.argv[3] || 'resultado.json';

// Verifica se o arquivo de entrada existe
const inputPath = path.resolve(process.cwd(), inputFile);
if (!fs.existsSync(inputPath)) {
  console.error(`Erro: O arquivo ${inputPath} não foi encontrado!`);
  console.log('Arquivos disponíveis no diretório atual:');
  console.log(fs.readdirSync(process.cwd()).join('\n'));
  process.exit(1);
}

//Gera a execuçao da categorização
try {
  const result = processProductData(inputFile, outputFile);
  console.log(`Total de categorias encontradas: ${result.length}`);
} catch (error) {
  console.error('Falha ao processar a categorização:', error.message);
  process.exit(1);
}