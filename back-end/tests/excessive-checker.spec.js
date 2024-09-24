const { ExcessiveCancellationsChecker } = require('../excessive-cancellations-checker');

describe('ExcessiveCancellationsChecker', () => {
  let checker;

  beforeEach(() => {
    checker = new ExcessiveCancellationsChecker('dummy/path');
  });

  describe('companiesInvolvedInExcessiveCancellations', () => {
    it('returns an array of companies with excessive cancellations', async () => {
      const mockData = [
        '2015-02-28 07:58:14,Bank of Mars,D,140',
        '2015-02-28 07:59:10,Bank of Mars,F,50',
        '2015-02-28 07:59:30,Bank of Mars,D,100',
        '2015-02-28 08:00:00,Bank of Mars,F,80',
        '2015-02-28 08:00:30,Cauldron Cooking,D,200',
        '2015-02-28 08:01:00,Cauldron Cooking,F,150',
      ];

      checker.processFile = jest.fn().mockImplementation(() => {
        mockData.forEach(line => checker.processLine(line));
      });

      const result = await checker.companiesInvolvedInExcessiveCancellations();
      expect(result).toEqual(['Bank of Mars', 'Cauldron Cooking']);
    });

    it('returns an empty array when no companies have excessive cancellations', async () => {
      const mockData = [
        '2015-02-28 07:58:14,Good Bank,D,140',
        '2015-02-28 07:59:10,Good Bank,F,20',
        '2015-02-28 07:59:30,Better Trading,D,100',
        '2015-02-28 08:00:00,Better Trading,F,10',
      ];

      checker.processFile = jest.fn().mockImplementation(() => {
        mockData.forEach(line => checker.processLine(line));
      });

      const result = await checker.companiesInvolvedInExcessiveCancellations();
      expect(result).toEqual([]);
    });
  });

  describe('totalNumberOfWellBehavedCompanies', () => {
    it('returns the correct number of well-behaved companies', async () => {
      const mockData = [
        '2015-02-28 07:58:14,Good Bank,D,140',
        '2015-02-28 07:59:10,Good Bank,F,20',
        '2015-02-28 07:59:30,Better Trading,D,100',
        '2015-02-28 08:00:00,Better Trading,F,10',
        '2015-02-28 08:00:30,Bad Company,D,200',
        '2015-02-28 08:01:00,Bad Company,F,150',
      ];

      checker.processFile = jest.fn().mockImplementation(() => {
        mockData.forEach(line => checker.processLine(line));
      });

      const result = await checker.totalNumberOfWellBehavedCompanies();
      expect(result).toBe(2);
    });

    it('returns 0 when all companies have excessive cancellations', async () => {
      const mockData = [
        '2015-02-28 07:58:14,Bad Bank,D,100',
        '2015-02-28 07:59:10,Bad Bank,F,55',
        '2015-02-28 07:59:30,Worse Trading,D,200',
        '2015-02-28 08:00:00,Worse Trading,F,150',
      ];

      checker.processFile = jest.fn().mockImplementation(() => {
        mockData.forEach(line => checker.processLine(line));
      });

      const result = await checker.totalNumberOfWellBehavedCompanies();
      expect(result).toBe(0);
    });
  });

  describe('processLine', () => {
    it('correctly handles valid input', () => {
      const line = '2015-02-28 07:58:14,Bank of Mars,D,140';
      checker.processLine(line);
      expect(checker.companies.size).toBe(1);
      expect(checker.companies.get('Bank of Mars').length).toBe(1);
    });

    it('ignores invalid input', () => {
      const line = 'invalid,input,data';
      checker.processLine(line);
      expect(checker.companies.size).toBe(0);
    });

    it('handles multiple trades for the same company', () => {
      const lines = [
        '2015-02-28 07:58:14,Bank of Mars,D,140',
        '2015-02-28 07:59:10,Bank of Mars,F,50',
        '2015-02-28 08:00:00,Bank of Mars,D,200',
      ];
      lines.forEach(line => checker.processLine(line));
      expect(checker.companies.size).toBe(1);
      expect(checker.companies.get('Bank of Mars').length).toBe(3);
    });

    it('handles trades for multiple companies', () => {
      const lines = [
        '2015-02-28 07:58:14,Bank of Mars,D,140',
        '2015-02-28 07:59:10,Cauldron Cooking,F,50',
        '2015-02-28 08:00:00,Ape Accountants,D,200',
      ];
      lines.forEach(line => checker.processLine(line));
      expect(checker.companies.size).toBe(3);
    });
  });

  describe('isExcessiveCancelling', () => {
    it('returns true for excessive cancelling', () => {
      const trades = [
        { timestamp: new Date('2015-02-28 07:58:14'), orderType: 'D', quantity: 100 },
        { timestamp: new Date('2015-02-28 07:59:10'), orderType: 'F', quantity: 40 },
        { timestamp: new Date('2015-02-28 07:59:30'), orderType: 'D', quantity: 50 },
      ];
      expect(checker.isExcessiveCancelling(trades)).toBe(true);
    });

    it('returns true for excessive cancelling', () => {
      const trades = [
        { timestamp: new Date('2015-02-28 07:58:14'), orderType: 'F', quantity: 100 },
        { timestamp: new Date('2015-02-28 07:59:10'), orderType: 'F', quantity: 20 },
        { timestamp: new Date('2015-02-28 07:59:11'), orderType: 'F', quantity: 50 },
      ];
      expect(checker.isExcessiveCancelling(trades)).toBe(true);
    });

    it('returns false for non-excessive cancelling', () => {
      const trades = [
        { timestamp: new Date('2015-02-28 07:58:14'), orderType: 'D', quantity: 100 },
        { timestamp: new Date('2015-02-28 07:59:10'), orderType: 'F', quantity: 20 },
        { timestamp: new Date('2015-02-28 07:59:11'), orderType: 'D', quantity: 50 },
      ];
      expect(checker.isExcessiveCancelling(trades)).toBe(false);
    });

    it('handles edge case with only new orders', () => {
      const trades = [
        { timestamp: new Date('2015-02-28 07:58:14'), orderType: 'D', quantity: 100 },
        { timestamp: new Date('2015-02-28 07:59:10'), orderType: 'D', quantity: 50 },
      ];
      expect(checker.isExcessiveCancelling(trades)).toBe(false);
    });

    it('handles edge case with only cancellations', () => {
      const trades = [
        { timestamp: new Date('2015-02-28 07:58:14'), orderType: 'F', quantity: 100 },
        { timestamp: new Date('2015-02-28 07:59:10'), orderType: 'F', quantity: 50 },
      ];
      expect(checker.isExcessiveCancelling(trades)).toBe(true);
    });

    


    it('correctly handles trades outside the 60-second window', () => {
      const trades = [
        { timestamp: new Date('2015-02-28 07:58:14'), orderType: 'D', quantity: 100 },
        { timestamp: new Date('2015-02-28 07:59:10'), orderType: 'F', quantity: 40 },
        { timestamp: new Date('2015-02-28 08:00:00'), orderType: 'D', quantity: 200 },
      ];
      expect(checker.isExcessiveCancelling(trades)).toBe(false);
    });


    it('khkhkhkh', () => {
      const trades = [
        { timestamp: new Date('2015-02-28 07:58:14'), orderType: 'D', quantity: 140 },
        { timestamp: new Date('2015-02-28 08:00:13'), orderType: 'D', quantity: 500 },
        { timestamp: new Date('2015-02-28 08:00:14'), orderType: 'D', quantity: 200 },
        { timestamp: new Date('2015-02-28 08:01:13'), orderType: 'F', quantity: 200 },
      ];
      expect(checker.isExcessiveCancelling(trades)).toBe(false);
    });
  });
});