// Sample data
const sampleData = {
  items: [
    {"name": "Item1", "length": 10, "breadth": 5, "height": 3, "weight": 2},
    {"name": "Item2", "length": 8, "breadth": 4, "height": 2, "weight": 1},
    {"name": "Item3", "length": 6, "breadth": 6, "height": 4, "weight": 1.5},
    {"name": "Item4", "length": 4, "breadth": 4, "height": 4, "weight": 0.8},
    {"name": "Item5", "length": 12, "breadth": 3, "height": 2, "weight": 1.2},
    {"name": "Item6", "length": 7, "breadth": 3, "height": 5, "weight": 0.9}
  ],
  boxes: [
    {"name": "SmallBox", "l": 12, "b": 8, "h": 6, "weight": 5},
    {"name": "MediumBox", "l": 15, "b": 10, "h": 8, "weight": 8},
    {"name": "LargeBox", "l": 20, "b": 15, "h": 12, "weight": 15}
  ]
};

// Color palette for visual representation
const colors = ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F', '#DB4545', '#D2BA4C', '#964325', '#944454', '#13343B'];

// Global state
let currentItems = [];
let currentBoxes = [];
let packingResults = null;

// DOM elements
const itemsContainer = document.getElementById('itemsContainer');
const boxesContainer = document.getElementById('boxesContainer');
const addItemBtn = document.getElementById('addItemBtn');
const addBoxBtn = document.getElementById('addBoxBtn');
const loadSampleDataBtn = document.getElementById('loadSampleData');
const packItemsBtn = document.getElementById('packItemsBtn');
const algorithmSelect = document.getElementById('algorithmSelect');
const progressContainer = document.getElementById('progressContainer');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const resultsSection = document.getElementById('resultsSection');

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
  setupEventListeners();
  addInitialForms();
});

function setupEventListeners() {
  addItemBtn.addEventListener('click', addItemForm);
  addBoxBtn.addEventListener('click', addBoxForm);
  loadSampleDataBtn.addEventListener('click', loadSampleData);
  packItemsBtn.addEventListener('click', runPackingAlgorithm);
}

function addInitialForms() {
  addItemForm();
  addBoxForm();
}

function addItemForm() {
  const template = document.getElementById('itemTemplate');
  const clone = template.content.cloneNode(true);
  
  const removeBtn = clone.querySelector('.remove-item');
  removeBtn.addEventListener('click', function() {
    this.closest('.item-form').remove();
  });
  
  itemsContainer.appendChild(clone);
}

function addBoxForm() {
  const template = document.getElementById('boxTemplate');
  const clone = template.content.cloneNode(true);
  
  const removeBtn = clone.querySelector('.remove-box');
  removeBtn.addEventListener('click', function() {
    this.closest('.box-form').remove();
  });
  
  boxesContainer.appendChild(clone);
}

function loadSampleData() {
  // Clear existing forms
  itemsContainer.innerHTML = '';
  boxesContainer.innerHTML = '';
  
  // Load sample items
  sampleData.items.forEach(item => {
    addItemForm();
    const lastForm = itemsContainer.lastElementChild;
    lastForm.querySelector('.item-name').value = item.name;
    lastForm.querySelector('.item-length').value = item.length;
    lastForm.querySelector('.item-breadth').value = item.breadth;
    lastForm.querySelector('.item-height').value = item.height;
    lastForm.querySelector('.item-weight').value = item.weight;
  });
  
  // Load sample boxes
  sampleData.boxes.forEach(box => {
    addBoxForm();
    const lastForm = boxesContainer.lastElementChild;
    lastForm.querySelector('.box-name').value = box.name;
    lastForm.querySelector('.box-l').value = box.l;
    lastForm.querySelector('.box-b').value = box.b;
    lastForm.querySelector('.box-h').value = box.h;
    lastForm.querySelector('.box-weight').value = box.weight;
  });
}

function collectFormData() {
  const items = [];
  const boxes = [];
  
  // Collect items
  const itemForms = itemsContainer.querySelectorAll('.item-form');
  itemForms.forEach(form => {
    const name = form.querySelector('.item-name').value.trim();
    const length = parseFloat(form.querySelector('.item-length').value);
    const breadth = parseFloat(form.querySelector('.item-breadth').value);
    const height = parseFloat(form.querySelector('.item-height').value);
    const weight = parseFloat(form.querySelector('.item-weight').value);
    
    if (name && !isNaN(length) && !isNaN(breadth) && !isNaN(height) && !isNaN(weight)) {
      items.push({ name, length, breadth, height, weight });
    }
  });
  
  // Collect boxes
  const boxForms = boxesContainer.querySelectorAll('.box-form');
  boxForms.forEach(form => {
    const name = form.querySelector('.box-name').value.trim();
    const l = parseFloat(form.querySelector('.box-l').value);
    const b = parseFloat(form.querySelector('.box-b').value);
    const h = parseFloat(form.querySelector('.box-h').value);
    const weight = parseFloat(form.querySelector('.box-weight').value);
    
    if (name && !isNaN(l) && !isNaN(b) && !isNaN(h) && !isNaN(weight)) {
      boxes.push({ name, l, b, h, weight });
    }
  });
  
  return { items, boxes };
}

function validateInput(items, boxes) {
  const errors = [];
  
  if (items.length === 0) {
    errors.push('Please add at least one item to pack.');
  }
  
  if (boxes.length === 0) {
    errors.push('Please add at least one box type.');
  }
  
  // Check for non-positive dimensions
  items.forEach((item, index) => {
    if (item.length <= 0 || item.breadth <= 0 || item.height <= 0 || item.weight <= 0) {
      errors.push(`Item ${item.name} has invalid dimensions or weight.`);
    }
  });
  
  boxes.forEach((box, index) => {
    if (box.l <= 0 || box.b <= 0 || box.h <= 0 || box.weight <= 0) {
      errors.push(`Box ${box.name} has invalid dimensions or weight capacity.`);
    }
  });
  
  return errors;
}

async function runPackingAlgorithm() {
  const { items, boxes } = collectFormData();
  const errors = validateInput(items, boxes);
  
  if (errors.length > 0) {
    displayError(errors.join('<br>'));
    return;
  }
  
  currentItems = items;
  currentBoxes = boxes;
  
  // Show progress
  showProgress();
  packItemsBtn.disabled = true;
  
  try {
    const algorithmType = algorithmSelect.value;
    updateProgress(20, 'Initializing algorithm...');
    
    await sleep(200);
    
    let result;
    if (algorithmType === 'auto') {
      updateProgress(40, 'Running First Fit Decreasing...');
      const ffdResult = await runBinPacking(items, boxes, 'ffd');
      
      updateProgress(70, 'Running Best Fit Decreasing...');
      const bfdResult = await runBinPacking(items, boxes, 'bfd');
      
      updateProgress(90, 'Selecting best result...');
      result = selectBestResult(ffdResult, bfdResult);
      result.algorithmUsed = result === ffdResult ? 'First Fit Decreasing' : 'Best Fit Decreasing';
    } else {
      updateProgress(50, `Running ${algorithmType.toUpperCase()}...`);
      result = await runBinPacking(items, boxes, algorithmType);
      result.algorithmUsed = algorithmType === 'ffd' ? 'First Fit Decreasing' : 'Best Fit Decreasing';
    }
    
    updateProgress(100, 'Complete!');
    await sleep(300);
    
    packingResults = result;
    displayResults(result);
    
  } catch (error) {
    console.error('Packing error:', error);
    displayError(`Error running algorithm: ${error.message}`);
  } finally {
    hideProgress();
    packItemsBtn.disabled = false;
  }
}

function showProgress() {
  progressContainer.classList.remove('hidden');
  updateProgress(0, 'Starting...');
}

function hideProgress() {
  setTimeout(() => {
    progressContainer.classList.add('hidden');
  }, 500);
}

function updateProgress(percentage, text) {
  progressFill.style.width = `${percentage}%`;
  progressText.textContent = text;
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 3D Bin Packing Algorithm Implementation
async function runBinPacking(items, boxTypes, algorithm) {
  // Sort items by volume (descending) for both FFD and BFD
  const sortedItems = [...items].sort((a, b) => {
    const volumeA = a.length * a.breadth * a.height;
    const volumeB = b.length * b.breadth * b.height;
    return volumeB - volumeA;
  });
  
  const packedBoxes = [];
  const unpackedItems = [];
  
  for (let i = 0; i < sortedItems.length; i++) {
    const item = sortedItems[i];
    let packed = false;
    
    // Try to pack in existing boxes first
    for (let box of packedBoxes) {
      if (canFitItem(item, box)) {
        const position = findBestPosition(item, box);
        if (position) {
          packItem(item, box, position);
          packed = true;
          break;
        }
      }
    }
    
    // If not packed, try new boxes
    if (!packed) {
      const bestBoxType = algorithm === 'bfd' ? 
        findBestFitBox(item, boxTypes) : 
        findFirstFitBox(item, boxTypes);
      
      if (bestBoxType) {
        const newBox = createNewBox(bestBoxType);
        const position = findBestPosition(item, newBox);
        if (position) {
          packItem(item, newBox, position);
          packedBoxes.push(newBox);
          packed = true;
        }
      }
    }
    
    if (!packed) {
      unpackedItems.push(item);
    }
  }
  
  return {
    packedBoxes,
    unpackedItems,
    totalBoxes: packedBoxes.length,
    packingEfficiency: calculatePackingEfficiency(packedBoxes)
  };
}

function canFitItem(item, box) {
  // Check weight constraint
  const currentWeight = box.items.reduce((sum, packedItem) => sum + packedItem.weight, 0);
  if (currentWeight + item.weight > box.weightCapacity) {
    return false;
  }
  
  // Try all 6 rotations
  const rotations = getAllRotations(item);
  
  for (let rotation of rotations) {
    if (rotation.length <= box.l && rotation.breadth <= box.b && rotation.height <= box.h) {
      // Check if there's space for this rotation
      const position = findPositionForRotation(rotation, box);
      if (position) {
        return true;
      }
    }
  }
  
  return false;
}

function getAllRotations(item) {
  const { length: l, breadth: b, height: h } = item;
  return [
    { length: l, breadth: b, height: h, rotation: 0 }, // Original
    { length: l, breadth: h, height: b, rotation: 1 }, // 90° around X
    { length: b, breadth: l, height: h, rotation: 2 }, // 90° around Z
    { length: b, breadth: h, height: l, rotation: 3 }, // 90° around Y
    { length: h, breadth: b, height: l, rotation: 4 }, // 180° around Y
    { length: h, breadth: l, height: b, rotation: 5 }  // 270° around Y
  ];
}

function findPositionForRotation(rotation, box) {
  // Simple grid-based approach
  const step = 1;
  for (let x = 0; x <= box.l - rotation.length; x += step) {
    for (let y = 0; y <= box.b - rotation.breadth; y += step) {
      for (let z = 0; z <= box.h - rotation.height; z += step) {
        if (isPositionValid(x, y, z, rotation, box)) {
          return { x, y, z };
        }
      }
    }
  }
  return null;
}

function findBestPosition(item, box) {
  const rotations = getAllRotations(item);
  let bestPosition = null;
  let bestScore = Infinity;
  
  for (let rotation of rotations) {
    if (rotation.length <= box.l && rotation.breadth <= box.b && rotation.height <= box.h) {
      // Try bottom-left-back strategy with simplified positioning
      const position = findPositionForRotation(rotation, box);
      if (position) {
        const score = position.x + position.y + position.z; // Prefer positions closer to origin
        if (score < bestScore) {
          bestScore = score;
          bestPosition = {
            x: position.x,
            y: position.y,
            z: position.z,
            length: rotation.length,
            breadth: rotation.breadth,
            height: rotation.height,
            rotation: rotation.rotation
          };
        }
      }
    }
  }
  
  return bestPosition;
}

function isPositionValid(x, y, z, rotation, box) {
  // Check bounds
  if (x + rotation.length > box.l || y + rotation.breadth > box.b || z + rotation.height > box.h) {
    return false;
  }
  
  // Check if position doesn't overlap with existing items
  for (let existingItem of box.items) {
    if (isOverlapping(
      x, y, z, rotation.length, rotation.breadth, rotation.height,
      existingItem.x, existingItem.y, existingItem.z,
      existingItem.length, existingItem.breadth, existingItem.height
    )) {
      return false;
    }
  }
  return true;
}

function isOverlapping(x1, y1, z1, l1, b1, h1, x2, y2, z2, l2, b2, h2) {
  return !(x1 >= x2 + l2 || x2 >= x1 + l1 ||
           y1 >= y2 + b2 || y2 >= y1 + b1 ||
           z1 >= z2 + h2 || z2 >= z1 + h1);
}

function packItem(item, box, position) {
  box.items.push({
    ...item,
    x: position.x,
    y: position.y,
    z: position.z,
    length: position.length,
    breadth: position.breadth,
    height: position.height,
    rotation: position.rotation,
    color: colors[box.items.length % colors.length]
  });
}

function findFirstFitBox(item, boxTypes) {
  for (let boxType of boxTypes) {
    if (canItemFitInBoxType(item, boxType)) {
      return boxType;
    }
  }
  return null;
}

function findBestFitBox(item, boxTypes) {
  let bestBox = null;
  let bestWaste = Infinity;
  
  for (let boxType of boxTypes) {
    if (canItemFitInBoxType(item, boxType)) {
      const boxVolume = boxType.l * boxType.b * boxType.h;
      const itemVolume = item.length * item.breadth * item.height;
      const waste = boxVolume - itemVolume;
      
      if (waste < bestWaste) {
        bestWaste = waste;
        bestBox = boxType;
      }
    }
  }
  
  return bestBox;
}

function canItemFitInBoxType(item, boxType) {
  if (item.weight > boxType.weight) {
    return false;
  }
  
  const rotations = getAllRotations(item);
  for (let rotation of rotations) {
    if (rotation.length <= boxType.l && rotation.breadth <= boxType.b && rotation.height <= boxType.h) {
      return true;
    }
  }
  
  return false;
}

function createNewBox(boxType) {
  return {
    ...boxType,
    items: [],
    weightCapacity: boxType.weight,
    id: Date.now() + Math.random()
  };
}

function calculatePackingEfficiency(packedBoxes) {
  let totalBoxVolume = 0;
  let totalItemVolume = 0;
  
  packedBoxes.forEach(box => {
    totalBoxVolume += box.l * box.b * box.h;
    box.items.forEach(item => {
      totalItemVolume += item.length * item.breadth * item.height;
    });
  });
  
  return totalBoxVolume > 0 ? (totalItemVolume / totalBoxVolume) * 100 : 0;
}

function selectBestResult(result1, result2) {
  // Prefer result with fewer boxes, then higher efficiency
  if (result1.totalBoxes !== result2.totalBoxes) {
    return result1.totalBoxes < result2.totalBoxes ? result1 : result2;
  }
  return result1.packingEfficiency > result2.packingEfficiency ? result1 : result2;
}

function displayResults(result) {
  const { packedBoxes, unpackedItems, totalBoxes, packingEfficiency, algorithmUsed } = result;
  
  // Show results section
  resultsSection.style.display = 'block';
  resultsSection.classList.remove('hidden');
  
  resultsSection.innerHTML = `
    <div class="card">
      <div class="card__header">
        <h3>Packing Results</h3>
      </div>
      <div class="card__body">
        <div class="summary-stats">
          <div class="stat-card">
            <div class="stat-value">${totalBoxes}</div>
            <div class="stat-label">Boxes Used</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${packingEfficiency.toFixed(1)}%</div>
            <div class="stat-label">Packing Efficiency</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${currentItems.length - unpackedItems.length}</div>
            <div class="stat-label">Items Packed</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${unpackedItems.length}</div>
            <div class="stat-label">Items Unpacked</div>
          </div>
        </div>
        
        ${algorithmUsed ? `<p><strong>Algorithm Used:</strong> ${algorithmUsed}</p>` : ''}
        
        ${packedBoxes.length > 0 ? `
          <div class="packed-boxes">
            <h4>Packed Boxes</h4>
            ${packedBoxes.map((box, index) => `
              <div class="box-result">
                <div class="box-header">
                  <strong>${box.name} #${index + 1}</strong>
                  <span style="float: right;">
                    Weight: ${box.items.reduce((sum, item) => sum + item.weight, 0).toFixed(1)}/${box.weightCapacity} kg
                  </span>
                </div>
                <div class="box-items">
                  ${box.items.map(item => `
                    <div class="box-item">
                      <div class="item-color" style="background-color: ${item.color};"></div>
                      <span><strong>${item.name}</strong></span>
                      <span>Dimensions: ${item.length}×${item.breadth}×${item.height}</span>
                      <span>Position: (${item.x}, ${item.y}, ${item.z})</span>
                      <span>Rotation: Type ${item.rotation}</span>
                    </div>
                  `).join('')}
                </div>
              </div>
            `).join('')}
          </div>
        ` : '<p>No items were successfully packed.</p>'}
        
        ${unpackedItems.length > 0 ? `
          <div class="unpacked-items">
            <h4>Unpacked Items</h4>
            ${unpackedItems.map(item => `
              <div class="unpacked-item">
                <span><strong>${item.name}</strong></span>
                <span>Dimensions: ${item.length}×${item.breadth}×${item.height}</span>
                <span>Weight: ${item.weight} kg</span>
                <span style="color: var(--color-error);">Could not fit in available boxes</span>
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>
    </div>
  `;
  
  // Scroll to results
  resultsSection.scrollIntoView({ behavior: 'smooth' });
}

function displayError(message) {
  resultsSection.style.display = 'block';
  resultsSection.classList.remove('hidden');
  resultsSection.innerHTML = `
    <div class="error-message">
      <strong>Error:</strong> ${message}
    </div>
  `;
}