const fs = require('fs');
const readline = require('readline');

class ExcessiveCancellationsChecker {
    constructor(filepath) {
        this.filepath = filepath;
        this.companies = new Map();
    }

    async processFile() {
        const fileStream = fs.createReadStream(this.filepath);
        const rl = readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity
        });

        for await (const line of rl) {
            this.processLine(line);
        }
    }

    processLine(line) {
        const [timestamp, company, orderType, quantity] = line.split(',');
        if (!timestamp || !company || !orderType || !quantity) return;
        
        // Validate timestamp
        const date = new Date(timestamp);
        if (isNaN(date.getTime())) return;
        
        // Validate order type
        if (orderType !== 'D' && orderType !== 'F') return;
        
        // Validate quantity
        const quantityNum = parseInt(quantity);
        if (isNaN(quantityNum) || quantityNum <= 0) return;

        if (!this.companies.has(company)) {
            this.companies.set(company, []);
        }

        const trade = {
            timestamp: new Date(timestamp),
            orderType,
            quantity: parseInt(quantity)
        };

        this.companies.get(company).push(trade);
    }

    isExcessiveCancelling(trades) {
        // Ensure the trades are sorted by timestamp before processing
        trades.sort((a, b) => a.timestamp - b.timestamp);
        
        let currentWindow = [];
        let periodOrders = 0;
        let periodCancels = 0;
            
        for (let i = 0; i < trades.length; i++) {
            const currentTrade = trades[i];
    
            // Remove trades from the window that are outside the 60-second window
            while (currentWindow.length > 0 && (currentTrade.timestamp - currentWindow[0].timestamp) / 1000 > 60) {
                const removedTrade = currentWindow.shift();
                if (removedTrade.orderType === 'D' || removedTrade.orderType === 'F') {
                    periodOrders -= removedTrade.quantity;
                }
                if (removedTrade.orderType === 'F') {
                    periodCancels -= removedTrade.quantity;
                }
            }
    
            // Add the current trade to the window
            currentWindow.push(currentTrade);
            if (currentTrade.orderType === 'D') {
                periodOrders += currentTrade.quantity;
            } else if (currentTrade.orderType === 'F') {
                periodCancels += currentTrade.quantity;
                periodOrders += currentTrade.quantity;
            }
    
            // Wait until all trades with the same timestamp are processed
            if (i + 1 < trades.length && trades[i + 1].timestamp.getTime() === currentTrade.timestamp.getTime()) {
                continue;
            }

            // Check if there are only cancels and no orders
            if (periodOrders === 0 && periodCancels > 0) {
                return true;
            }

            // Check if the ratio exceeds 1/3
            if (periodOrders > 0 && periodCancels > periodOrders / 3) {
                return true;
            }
        }
    
        return false;
    }

    async companiesInvolvedInExcessiveCancellations() {
        await this.processFile();
        const excessiveCancellingCompanies = [];

        for (const [company, trades] of this.companies) {
            if (this.isExcessiveCancelling(trades)) {
                excessiveCancellingCompanies.push(company);
            }
        }

        return excessiveCancellingCompanies;
    }

    async totalNumberOfWellBehavedCompanies() {
        await this.processFile();
        let wellBehavedCount = 0;

        for (const [company, trades] of this.companies) {
            if (!this.isExcessiveCancelling(trades)) {
                wellBehavedCount++;
            }
        }

        return wellBehavedCount;
    }
}

module.exports = { ExcessiveCancellationsChecker };
