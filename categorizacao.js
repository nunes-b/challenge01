/**
 * Solução para categorização de produtos de supermercado
 * 
 * Esta solução categoriza produtos similares mesmo com variações na descrição,
 * mantendo distinção entre produtos diferentes de acordo com os requisitos.
 */

const fs = require('fs');

/**
 * Normaliza uma string para facilitar comparações
 */
function normalizeString(str) {
  return str.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[-\s]+/g, ' ') // Substitui hífens e múltiplos espaços por espaço único
    .trim();
}

/**
 * Padroniza unidades de medida
 */
function standardizeUnit(str) {
  return str
    .replace(/litro/i, 'l')
    .replace(/quilo/i, 'kg');
}

/**
 * Cria uma assinatura única para cada produto baseada em suas características
 */
function createProductSignature(title) {
  const normalized = normalizeString(title);
  const words = normalized.split(' ');
  
  // Identifica características do produto
  let productType = '';
  let brand = '';
  let size = '';
  let baseProduct = '';

  // Lista de tipos conhecidos
  const knownTypes = ['integral', 'desnatado', 'semi desnatado', 'branco', 'carioca'];
  
  // Lista de marcas conhecidas
  const knownBrands = ['piracanjuba', 'italac', 'parmalat', 'tio joao', 'camil'];
  
  // Lista de produtos base
  const knownBaseProducts = ['leite', 'arroz', 'feijao'];
  
  // Identifica o produto base
  for (const word of words) {
    if (knownBaseProducts.includes(word)) {
      baseProduct = word;
      break;
    }
  }
  
  // Identifica a marca
  for (const knownBrand of knownBrands) {
    if (normalized.includes(knownBrand)) {
      brand = knownBrand;
      break;
    }
  }
  
  // Identifica o tipo
  for (const knownType of knownTypes) {
    if (normalized.includes(knownType)) {
      productType = knownType;
      break;
    }
  }
  
  // Identifica tamanho/quantidade
  for (const word of words) {
    if (/\d+/.test(word)) {
      const nextIndex = words.indexOf(word) + 1;
      if (nextIndex < words.length) {
        const unit = words[nextIndex];
        if (['l', 'kg', 'g', 'ml'].includes(unit) || unit.startsWith('l') || unit.startsWith('kg')) {
          size = `${word} ${unit}`;
          size = standardizeUnit(size);
          break;
        }
      }
    }
  }
  
  // Se não encontrou o tamanho na forma separada, procura por padrões como "1l", "5kg"
  if (!size) {
    for (const word of words) {
      if (/\d+(l|kg|g|ml)/.test(word)) {
        size = word;
        break;
      }
    }
  }
  
  // Cria a assinatura única
  return `${baseProduct}-${brand}-${productType}-${size}`;
}

/**
 * Função principal para categorizar produtos
 */

function categorizeProducts(data) {
  const categories = {};
  
  // Agrupar produtos por assinatura
  data.forEach(product => {
    const signature = createProductSignature(product.title);
    
    if (!categories[signature]) {
      categories[signature] = {
        categoryName: product.title,
        products: []
      };
    }
    
    categories[signature].products.push({
      title: product.title,
      supermarket: product.supermarket
    });
  });
  
  return Object.values(categories).map(category => ({
    category: category.categoryName,
    count: category.products.length,
    products: category.products
  }));
}

function processProductData(inputFile = 'data01.json', outputFile = 'resultado.json') {
  try {
    const path = require('path');
    const inputPath = path.resolve(process.cwd(), inputFile);
    const outputPath = path.resolve(process.cwd(), outputFile);
    
    console.log(`Tentando ler arquivo de: ${inputPath}`);
    
    const data = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
    
    // Valida os dados de entrada
    validateInputData(data);
    
    const result = categorizeProducts(data);
    
    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
    console.log(`Categorização concluída com sucesso! Resultado salvo em ${outputPath}`);
    return result;
  } catch (error) {
    console.error('Erro ao processar dados:', error.message);
    throw error;
  }
}

/**
 * Valida os dados de entrada para garantir que estão no formato esperado
 */
function validateInputData(data) {
  if (!Array.isArray(data)) {
    throw new Error('O arquivo de entrada deve ser um array de produtos.');
  }

  data.forEach((product, index) => {
    if (!product.title || typeof product.title !== 'string') {
      throw new Error(`Produto na posição ${index} não possui um "title" válido.`);
    }
    if (!product.supermarket || typeof product.supermarket !== 'string') {
      throw new Error(`Produto na posição ${index} não possui um "supermarket" válido.`);
    }
  });

  console.log('Validação de entrada concluída com sucesso!');
}

if (require.main === module) {
  processProductData();
}

module.exports = { categorizeProducts, processProductData };