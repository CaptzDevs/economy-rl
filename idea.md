## TODO
    - Add feature which can tell agent if eat when hunger > 80 it's bad for health 



## Entity 
### หมวดหมู่  Entity                              
 ---
- บุคคล         Agent (Citizen)                     
- ธุรกิจ          Business                                
- การเงิน        Bank, Currency                      
- รัฐ            Government                          
- ตลาด          Market                              
- ทรัพยากร       Natural Resource                    
- สินค้า          Product, Service                    
- เวลา           Time Engine                         
- ระบบ AI        Behavior Logic / AI Decision Engine 

## Basic States
- Energy*            พลังงาน เหนื่อยเมื่อทำงานหรือเคลื่อนไหว  
- Hunger*            ความหิว เพิ่มขึ้นตามเวลา ลดลงเมื่อกินอาหาร  
- Health*            สุขภาพ ลดลงหากขาดอาหาร น้ำ หรือพักผ่อน  
- Happiness*         ความสุข ขึ้นอยู่กับการใช้ชีวิตและสิ่งแวดล้อม  
- Social           ความต้องการเข้าสังคม ลดลงเมื่ออยู่ลำพังนาน 
- Hygiene           ความสะอาด ลดลงเมื่อทำกิจกรรม ต้องชำระล้าง  

## Personality
- Laziness         แนวโน้มที่จะหลีกเลี่ยงการทำงานหากไม่จำเป็น         
- Greed            ความโลภ ต้องการสะสมทรัพย์หรือสิ่งของมากขึ้น       
- Thriftiness      ความประหยัด ใช้จ่ายน้อยแม้มีเงิน                     
- Generosity       ความมีน้ำใจ พร้อมช่วยเหลือหรือบริจาค                
- Patience         ความอดทน รอได้ ไม่รีบตัดสินใจ                        
- Aggression       ความก้าวร้าว ตัดสินใจเร็ว ไม่ลังเล                   
- Sociability      ความชอบเข้าสังคม ชอบปฏิสัมพันธ์กับ agent อื่น        
- Risk-taking      ความกล้าเสี่ยง ยอมลงทุนสูงเพื่อผลตอบแทนมาก        
- Stability        ความมั่นคงทางอารมณ์ ไม่เปลี่ยนแปลงพฤติกรรมง่าย    
- Ambition         ความทะเยอทะยาน ต้องการความก้าวหน้า  

## Desire
- Eat              ความอยากกินอาหาร เพิ่มขึ้นเมื่อหิว                  
- Rest             ความอยากพักผ่อน เพิ่มขึ้นเมื่อพลังงานลด              
- EarnMoney        ความอยากมีเงิน/รายได้ ใช้จ่ายได้มากขึ้น             
- Socialize        ความอยากเข้าสังคม พบปะผู้คน พูดคุย                  
- BuyLuxury        ความอยากได้ของดี/ฟุ่มเฟือย                            
- Reproduce        ความอยากสร้างครอบครัว/มีลูก                         
- LearnSkill       ความอยากเรียนรู้ทักษะใหม่ ๆ                           
- Safety           ความอยากอยู่รอด/ความมั่นคงในชีวิต 
 


## Entity Props
### Agent 
    {
        id: 'agent-001',
        role: 'citizen', 
        job : 'none',
        age: 23,       
        name: 'Alice',
        money: 100,
        state : {
            Energy : 100,
            Hunger : 100,
            Health : 100,
            Happiness : 100,
        }
        inventory: {
            food: 3,
            rawMaterial: 0,
            product: 0
        },
        personality: {
            laziness: 0.4,
            greed: 0.7,
            thriftiness: 0.2
        },
        memory: {
            lastActions: [],
            hungerLog: [],
            tradeHistory: [],
        },
        strategy: 'bt' | 'rl' | 'manual', // strategy used
        decideAndAct: (market) => {},     // main decision logic
    }

### Business   
    {
        id: 'biz-001',
        name: 'FreshFarm Co.',
        type: 'farm' | 'factory' | 'shop' | 'service',

        owner: 'agent-123',
        capital: 1000,
        workers: ['agent-124', 'agent-125'],
        wagePerWorker: 20,

        production: {
            input: { water: 1, seed: 2 },
            output: { food: 5 },
            rate: 1 // per tick
        },

        inventory: {
            water: 20,
            seed: 30,
            food: 10
        },

        pricing: {
            food: 15
        },

        strategy: 'maximize-profit' | 'low-price' | 'fixed',

        autoRestock: true,
        restockSources: ['market', 'government'],

        log: []
    }

### Bank 
    {
        id: 'bank-001',
        name: 'Global Bank',
        capital: 50000,
        clients: ['agent-001', 'biz-002'],
        
        interestRate: 0.05, // % ต่อรอบ
        loanList: [
            {
            borrowerId: 'agent-001',
            amount: 100,
            rate: 0.05,
            dueTick: 50,
            status: 'active' | 'paid' | 'defaulted'
            }
        ],

        depositAccounts: {
            'agent-002': 500,
            'biz-001': 2000
        },

        services: ['loan', 'deposit'],

        offerLoan(agent, amount, rate) { /* ... */ },
        receiveDeposit(agent, amount) { /* ... */ },

        log: []
    }

### Currency 
    {
        id: 'currency-baht',
        name: 'Baht',
        symbol: '฿',
        totalSupply: 100000,
        inflationRate: 0.02,
        controlledBy: 'government',
        
        exchangeRate: {
            USD: 0.03
        },

        // หากมีระบบหลายสกุลเงิน
        issue(amount) { /* เพิ่ม supply */ },
        burn(amount) { /* ลด supply */ }
    }

### Government 
    {
        id: 'gov-001',
        name: 'ThailandSimGov',
        taxRate: {
            income: 0.1,
            sales: 0.05,
            corporate: 0.15
        },

        regulations: {
            maxPrice: {
            food: 50,
            housing: 200
            },
            minWage: 20
        },

        budget: 100000,
        collectedTax: 0,

        welfarePrograms: {
            unemployment: 500,
            universalBasicIncome: 100
        },

        subsidize(entityId, amount) { /* ... */ },
        collectTax(agentOrBiz) { /* ... */ },

        controlCurrency: 'currency-baht',
        owns: ['hospital-001', 'school-001'],

        log: []
    }

### Market 
    {
        id: 'market-central',
        name: 'Main Market',
        
        inventory: {
            food: 500,
            water: 1000,
            seed: 200,
            product: 300
        },

        priceList: {
            food: 10,
            water: 2,
            seed: 5
        },

        transactions: [], // [{buyer, seller, item, price, tick}]
        
        pricingStrategy: 'dynamic' | 'fixed',

        updatePrices() { /* based on supply/demand */ },
        buyItem(agent, item, amount) { /* ... */ },
        sellItem(agent, item, amount) { /* ... */ },

        log: []
    }

### Natural Resource
    {
        id: 'res-001',
        type: 'water' | 'tree' | 'mine' | 'land',
        location: { x: 20, y: 40 },
        quantity: 1000,
        regenRate: 2, // per tick
        extractedBy: ['agent-003', 'biz-001'],

        status: 'available' | 'depleted' | 'protected',

        extract(agent, amount) { /* update quantity */ },
        regenerate() { /* ... */ },

        log: []
    }

## Career / Job 

-            ทำงานในธุรกิจ รับค่าจ้างตามskill                     
- Farmer          ผลิตวัตถุดิบจากทรัพยากรธรรมชาติ เช่น อาหาร            
- Merchant         ซื้อ-ขายสินค้าระหว่าง agent และตลาด                   
- Student         ศึกษาเพื่อพัฒนาทักษะ ไม่สามารถทำงานได้                 
- Unemployed      ไม่มีงานทำ อาจขอรับสวัสดิการจากรัฐ                    

### Worker             
    {
        title: 'worker',
        skill: ['production', 'assembly'],
        wage: 20,
        employerId: 'biz-123',
        workHours: 8,
    }

### Farmer
    {
        title: 'farmer',
        ownLand: true,
        tools: ['shovel', 'seeds'],
        production: {
            crop: 'food',
            rate: 3
        },
        sellTo: 'market'
    }

### Merchant   
    {
        title: 'merchant',
        shopId: 'shop-001',
        products: ['food', 'product'],
        pricingStrategy: 'profit-margin',
        capital: 500,
    }
### Student
    {
        title: 'student',
        educationLevel: 'basic' | 'advanced',
        schoolId: 'school-001',
        gainSkill: ['crafting', 'math'],
        duration: 20 // ticks
    }
### Unemployed
    {
    title: 'unemployed',
    reason: 'no skill' | 'fired' | 'no demand',
    lookingForJob: true,
    }

### ธุรกิจ (Business)

- Factory          แปลงวัตถุดิบให้เป็นสินค้าสำเร็จรูป                
- Farm             ผลิตอาหารจากน้ำ เมล็ดพันธุ์ และที่ดิน               
- Shop             ซื้อมาขายไป ซื้อจากเอเจนต์/ตลาดแล้วขายต่อ         
- Service          ให้บริการ เช่น ขนส่ง ซ่อมแซม หรือดูแล          