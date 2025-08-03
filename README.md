<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/0bb3a358-fe23-4d03-be5d-9ba71d4c1d28" />




# 3D Bin Packing Algorithm Implementation

<!-- Complete JavaScript Solution

```javascript
class Item {
    constructor(name, length, breadth, height, weight = 0) {
        this.name = name;
        this.originalDimensions = { length, breadth, height };
        this.length = length;
        this.breadth = breadth;
        this.height = height;
        this.weight = weight;
        this.rotationType = 0;
        this.position = { x: 0, y: 0, z: 0 };
        this.packed = false;
    }

    // Get all 6 possible rotations of the item
    getAllRotations() {
        const { length: l, breadth: b, height: h } = this.originalDimensions;
        return [
            { length: l, breadth: b, height: h, rotationType: 0 }, // Original
            { length: l, breadth: h, height: b, rotationType: 1 }, // 90° around X
            { length: b, breadth: l, height: h, rotationType: 2 }, // 90° around Z
            { length: b, breadth: h, height: l, rotationType: 3 }, // 90° around Y
            { length: h, breadth: l, height: b, rotationType: 4 }, // 180° around Y
            { length: h, breadth: b, height: l, rotationType: 5 }  // 270° around Y
        ];
    }

    setRotation(rotationType) {
        const rotations = this.getAllRotations();
        const rotation = rotations[rotationType];
        this.length = rotation.length;
        this.breadth = rotation.breadth;
        this.height = rotation.height;
        this.rotationType = rotationType;
    }

    getVolume() {
        return this.length * this.breadth * this.height;
    }
}

class Box {
    constructor(name, l, b, h, weightCapacity = Infinity) {
        this.name = name;
        this.l = l;
        this.b = b;
        this.h = h;
        this.weightCapacity = weightCapacity;
        this.items = [];
        this.usedWeight = 0;
        this.usedVolume = 0;
    }

    getVolume() {
        return this.l * this.b * this.h;
    }

    getRemainingWeight() {
        return this.weightCapacity - this.usedWeight;
    }

    getRemainingVolume() {
        return this.getVolume() - this.usedVolume;
    }

    canFitItem(item, rotation) {
        // Check dimensional constraints
        if (rotation.length > this.l || 
            rotation.breadth > this.b || 
            rotation.height > this.h) {
            return false;
        }

        // Check weight constraints
        if (this.usedWeight + item.weight > this.weightCapacity) {
            return false;
        }

        return true;
    }

    addItem(item) {
        this.items.push(item);
        this.usedWeight += item.weight;
        this.usedVolume += item.getVolume();
        item.packed = true;
    }
}

class BinPacker3D {
    constructor() {
        this.boxes = [];
        this.items = [];
        this.packedItems = [];
        this.unpackedItems = [];
        this.usedBoxes = [];
    }

    setBoxes(boxes) {
        this.boxes = boxes.map(box => new Box(box.name, box.l, box.b, box.h, box.weight || Infinity));
        // Sort boxes by volume (smallest first) for optimization
        this.boxes.sort((a, b) => a.getVolume() - b.getVolume());
    }

    setItems(items) {
        this.items = items.map(item => new Item(item.name, item.length, item.breadth, item.height, item.weight || 0));
    }

    // First Fit Decreasing algorithm with rotation
    packFirstFitDecreasing() {
        // Sort items by volume in decreasing order
        const sortedItems = [...this.items].sort((a, b) => b.getVolume() - a.getVolume());
        
        this.packedItems = [];
        this.unpackedItems = [];
        this.usedBoxes = [];

        for (const item of sortedItems) {
            let packed = false;

            // Try to pack in existing boxes first
            for (const usedBox of this.usedBoxes) {
                if (this.tryPackItemInBox(item, usedBox)) {
                    packed = true;
                    break;
                }
            }

            // If not packed, try a new box
            if (!packed) {
                for (const boxTemplate of this.boxes) {
                    const newBox = new Box(boxTemplate.name, boxTemplate.l, boxTemplate.b, boxTemplate.h, boxTemplate.weightCapacity);
                    
                    if (this.tryPackItemInBox(item, newBox)) {
                        this.usedBoxes.push(newBox);
                        packed = true;
                        break;
                    }
                }
            }

            if (packed) {
                this.packedItems.push(item);
            } else {
                this.unpackedItems.push(item);
            }
        }
    }

    tryPackItemInBox(item, box) {
        const rotations = item.getAllRotations();

        for (const rotation of rotations) {
            if (box.canFitItem(item, rotation)) {
                // Set the item to this rotation and pack it
                item.setRotation(rotation.rotationType);
                item.position = { x: 0, y: 0, z: 0 };
                box.addItem(item);
                return true;
            }
        }
        return false;
    }

    // Best Fit Decreasing algorithm
    packBestFitDecreasing() {
        const sortedItems = [...this.items].sort((a, b) => b.getVolume() - a.getVolume());
        
        this.packedItems = [];
        this.unpackedItems = [];
        this.usedBoxes = [];

        for (const item of sortedItems) {
            let bestBox = null;
            let bestRotation = null;
            let bestFit = Infinity;

            // Check existing boxes for best fit
            for (const usedBox of this.usedBoxes) {
                const rotations = item.getAllRotations();
                
                for (const rotation of rotations) {
                    if (usedBox.canFitItem(item, rotation)) {
                        const wastedSpace = usedBox.getRemainingVolume() - item.getVolume();
                        if (wastedSpace < bestFit) {
                            bestFit = wastedSpace;
                            bestBox = usedBox;
                            bestRotation = rotation;
                        }
                    }
                }
            }

            // If no suitable existing box, try new boxes
            if (!bestBox) {
                for (const boxTemplate of this.boxes) {
                    const newBox = new Box(boxTemplate.name, boxTemplate.l, boxTemplate.b, boxTemplate.h, boxTemplate.weightCapacity);
                    const rotations = item.getAllRotations();
                    
                    for (const rotation of rotations) {
                        if (newBox.canFitItem(item, rotation)) {
                            const wastedSpace = newBox.getVolume() - item.getVolume();
                            if (wastedSpace < bestFit) {
                                bestFit = wastedSpace;
                                bestBox = newBox;
                                bestRotation = rotation;
                            }
                        }
                    }
                }
            }

            // Pack the item if a suitable box was found
            if (bestBox && bestRotation) {
                item.setRotation(bestRotation.rotationType);
                item.position = { x: 0, y: 0, z: 0 };
                
                if (!this.usedBoxes.includes(bestBox)) {
                    this.usedBoxes.push(bestBox);
                }
                
                bestBox.addItem(item);
                this.packedItems.push(item);
            } else {
                this.unpackedItems.push(item);
            }
        }
    }

    // Main packing function
    pack() {
        // Try First Fit Decreasing
        this.packFirstFitDecreasing();
        const ffdResult = {
            usedBoxes: [...this.usedBoxes],
            packedItems: [...this.packedItems],
            unpackedItems: [...this.unpackedItems],
            boxCount: this.usedBoxes.length
        };

        // Reset for Best Fit Decreasing
        this.items.forEach(item => {
            item.packed = false;
            item.position = { x: 0, y: 0, z: 0 };
            item.setRotation(0);
        });

        this.packBestFitDecreasing();
        const bfdResult = {
            usedBoxes: [...this.usedBoxes],
            packedItems: [...this.packedItems],
            unpackedItems: [...this.unpackedItems],
            boxCount: this.usedBoxes.length
        };

        // Return the result with fewer boxes used
        const bestResult = ffdResult.boxCount <= bfdResult.boxCount ? ffdResult : bfdResult;
        
        this.usedBoxes = bestResult.usedBoxes;
        this.packedItems = bestResult.packedItems;
        this.unpackedItems = bestResult.unpackedItems;

        return this.getPackingResult();
    }

    getPackingResult() {
        return {
            usedBoxes: this.usedBoxes.map(box => ({
                name: box.name,
                dimensions: { l: box.l, b: box.b, h: box.h },
                weightCapacity: box.weightCapacity,
                usedWeight: box.usedWeight,
                usedVolume: box.usedVolume,
                remainingWeight: box.getRemainingWeight(),
                remainingVolume: box.getRemainingVolume(),
                items: box.items.map(item => ({
                    name: item.name,
                    dimensions: { 
                        length: item.length, 
                        breadth: item.breadth, 
                        height: item.height 
                    },
                    originalDimensions: item.originalDimensions,
                    weight: item.weight,
                    rotationType: item.rotationType,
                    position: item.position
                }))
            })),
            totalBoxesUsed: this.usedBoxes.length,
            packedItemsCount: this.packedItems.length,
            unpackedItems: this.unpackedItems.map(item => ({
                name: item.name,
                dimensions: item.originalDimensions,
                weight: item.weight,
                reason: "Could not fit in any available box"
            })),
            summary: {
                totalItems: this.items.length,
                packedItems: this.packedItems.length,
                unpackedItems: this.unpackedItems.length,
                totalBoxesUsed: this.usedBoxes.length,
                packingEfficiency: this.packedItems.length / this.items.length
            }
        };
    }
}

// Example usage
function example() {
    const items = [
        { name: "Item1", length: 10, breadth: 5, height: 3, weight: 2 },
        { name: "Item2", length: 8, breadth: 4, height: 2, weight: 1 },
        { name: "Item3", length: 6, breadth: 6, height: 4, weight: 1.5 },
        { name: "Item4", length: 4, breadth: 4, height: 4, weight: 0.8 },
        { name: "Item5", length: 12, breadth: 3, height: 2, weight: 1.2 }
    ];

    const boxes = [
        { name: "SmallBox", l: 12, b: 8, h: 6, weight: 5 },
        { name: "MediumBox", l: 15, b: 10, h: 8, weight: 8 },
        { name: "LargeBox", l: 20, b: 15, h: 12, weight: 15 }
    ];

    const packer = new BinPacker3D();
    packer.setBoxes(boxes);
    packer.setItems(items);
    
    const result = packer.pack();
    console.log(JSON.stringify(result, null, 2));
    return result;
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { BinPacker3D, Item, Box };
} -->

## Usage Instructions

1. **Create Items Array**: Define your items with name, dimensions, and weight
2. **Create Boxes Array**: Define available boxes with dimensions and weight capacity
3. **Initialize Packer**: Create a new BinPacker3D instance
4. **Set Data**: Use setBoxes() and setItems() methods
5. **Pack**: Call the pack() method to get optimized results

## Key Features

- **6-Rotation Support**: Items can be rotated in all possible orientations
- **Weight Constraints**: Enforces weight limits for each box
- **Dual Algorithm Approach**: Uses both First Fit Decreasing and Best Fit Decreasing
- **Optimization**: Automatically selects the result with fewer boxes
- **Comprehensive Output**: Detailed results including packing efficiency and unused items
