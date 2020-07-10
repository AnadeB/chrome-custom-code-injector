import { IOption, IPageRange, IPageNavQuery, IRelPage, IRelPageCtx, IPageSlice, IPageCtx } from './type';
import { PgnHandle } from './';

describe('Class - Paginate Handle', () => {
    let handle: PgnHandle;
    let defOption: IOption;
    let isGteZeroSpy: jest.SpyInstance;
    let isDefinedSpy: jest.SpyInstance;
    let getNoPerPageSpy: jest.SpyInstance;
    let getTotalPageSpy: jest.SpyInstance;
    let canNavToPageSpy: jest.SpyInstance;
    let getCurrPageSpy: jest.SpyInstance;
    let getPageSliceIdxSpy: jest.SpyInstance;
    let getRelPageSpy: jest.SpyInstance;
    let getRelPageCtxSpy: jest.SpyInstance;
    let parseRelPageSpy: jest.SpyInstance;
    let getRecordCtxSpy: jest.SpyInstance;
    let getSpreadCtxSpy: jest.SpyInstance;
    let getDefStateSpy: jest.SpyInstance;
    let getDefOptionSpy: jest.SpyInstance;

    beforeEach(() => {
        handle = new PgnHandle();
        defOption = handle.getDefOption();
        isGteZeroSpy = jest.spyOn(handle, 'isGteZero');
        isDefinedSpy = jest.spyOn(handle, 'isDefined');
        getNoPerPageSpy = jest.spyOn(handle, 'getNoPerPage');
        getTotalPageSpy = jest.spyOn(handle, 'getTotalPage');
        canNavToPageSpy = jest.spyOn(handle, 'canNavToPage');
        getCurrPageSpy = jest.spyOn(handle, 'getCurrPage');
        getPageSliceIdxSpy = jest.spyOn(handle, 'getPageSliceIdx');
        getRelPageSpy = jest.spyOn(handle, 'getRelPage');
        getRelPageCtxSpy = jest.spyOn(handle, 'getRelPageCtx');
        parseRelPageSpy = jest.spyOn(handle, 'parseRelPage');
        getRecordCtxSpy = jest.spyOn(handle, 'getRecordCtx');
        getSpreadCtxSpy = jest.spyOn(handle, 'getSpreadCtx');
        getDefStateSpy = jest.spyOn(handle, 'getDefState');
        getDefOptionSpy = jest.spyOn(handle, 'getDefOption');
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    describe('Method: createState - Get Pagination state based on list and user option', () => {
        const mockList: any[] = ['a', 'b', 'c', 'd', 'e', 'f'];

        describe('test with spied/mocked methods', () => {
            const mockPgnOption: Partial<IOption> = {};
            const mockNoPerPage: number = 20;
            const mockEmptyObj = {};
            let increment: number[];
            let incrementIdx: number;

            beforeEach(() => {
                ({ increment, incrementIdx } = defOption);
                getNoPerPageSpy.mockReturnValue(mockNoPerPage);
                getDefStateSpy.mockReturnValue(mockEmptyObj);
                getTotalPageSpy.mockReturnValue(1);
                getRecordCtxSpy.mockReturnValue(mockEmptyObj);
                getSpreadCtxSpy.mockReturnValue(mockEmptyObj);
            });

            it('should return def paginate state when list only has 1 or less items', () => {
                expect(handle.createState(['a'], mockPgnOption)).toEqual(mockEmptyObj);
                expect(getDefOptionSpy).toHaveBeenCalled();
                expect(getNoPerPageSpy).toHaveBeenCalledWith(increment, incrementIdx, increment[0]);
                expect(getDefStateSpy).toHaveBeenCalledWith(1, mockNoPerPage);
                expect(getTotalPageSpy).not.toHaveBeenCalled();
            });

            it('should return def paginate state when total page is lte 1', () => {
                expect(handle.createState(mockList, mockPgnOption)).toEqual(mockEmptyObj);
                expect(getDefOptionSpy).toHaveBeenCalled();
                expect(getNoPerPageSpy).toHaveBeenCalledWith(increment, incrementIdx, increment[0]);
                expect(getTotalPageSpy).toHaveBeenCalledWith(mockList.length, mockNoPerPage);
                expect(getDefStateSpy).toHaveBeenCalledWith(mockList.length, mockNoPerPage);
                expect(getCurrPageSpy).not.toHaveBeenCalled();
            });

            it('should return paginate state when total list has more than 1 items and total page is more than 1', () => {
                const { page } = defOption;

                const mockCurrPage: number = 0;
                const mockCurrPageNo: number = 1;
                const mockCurrPageCtx: IPageCtx = {curr: mockCurrPage, pageNo: mockCurrPageNo};
                const mockTotalPage: number = 20;
                const mockSliceIdx: IPageSlice = {startIdx: 0, endIdx: 1};
                const mockRelPage: IRelPage = {first: 1, prev: 1, next: 1, last: 1};
                const mockRelPageCtx: IRelPageCtx = {first: true, prev: true, next: true, last: true};
                const mockParsedRelPage: IRelPage = {first: 2, prev: 2, next: 2, last: 2};

                getTotalPageSpy.mockReturnValue(mockTotalPage);
                getCurrPageSpy.mockReturnValue(mockCurrPageCtx);
                getPageSliceIdxSpy.mockReturnValue(mockSliceIdx);
                getRelPageSpy.mockReturnValue(mockRelPage);
                getRelPageCtxSpy.mockReturnValue(mockRelPageCtx);
                parseRelPageSpy.mockReturnValue(mockParsedRelPage);

                expect(handle.createState(mockList, mockPgnOption)).toEqual({
                    ...mockSliceIdx,
                    ...mockParsedRelPage,
                    curr: mockCurrPage,
                    pageNo: mockCurrPageNo,
                    perPage: mockNoPerPage,
                    totalPage: mockTotalPage
                });
                expect(getDefOptionSpy).toHaveBeenCalled();
                expect(getNoPerPageSpy).toHaveBeenCalledWith(increment, incrementIdx, increment[0]);
                expect(getDefStateSpy).toHaveBeenCalledWith(mockList.length, mockNoPerPage);
                expect(getTotalPageSpy).toHaveBeenCalledWith(mockList.length, mockNoPerPage);
                expect(getCurrPageSpy).toHaveBeenCalledWith(page, mockTotalPage-1);
                expect(getPageSliceIdxSpy).toHaveBeenCalledWith(mockList, mockNoPerPage, page);
                expect(getRelPageSpy).toHaveBeenCalledWith(mockTotalPage, page);
                expect(getRelPageCtxSpy).toHaveBeenCalledWith({curr: page, last: mockRelPage.last}, mockRelPage);
                expect(getSpreadCtxSpy).toHaveBeenCalledWith(mockCurrPageNo, mockTotalPage);
                expect(parseRelPageSpy).toHaveBeenCalledWith(mockRelPage, mockRelPageCtx);
            });
        });

        describe('test with unspied/unmocked methods', () => {
            const mockPerPage: number = 4;
            const mockPgnOption: Partial<IOption> = { increment: [mockPerPage] };

            it('should return paginate state by default', () => {
                expect(handle.createState(mockList, mockPgnOption)).toEqual({
                    curr: 0,
                    startIdx: 0,
                    endIdx: 4,
                    first: null,
                    prev: null,
                    next: 1,
                    last: 1,
                    pageNo: 1,
                    totalPage: 2,
                    perPage: mockPerPage,
                    startRecord: 1,
                    endRecord: 4,
                    totalRecord: mockList.length,
                    ltSpread: null,
                    rtSpread: null,
                    maxSpread: 3,
                });
            });

            it('should return paginate state when provided current page index', () => {
                const mockCurrPage: number = 1;
                expect(handle.createState(mockList, {...mockPgnOption, page: mockCurrPage})).toEqual({
                    curr: mockCurrPage,
                    startIdx: 4,
                    endIdx: undefined,
                    first: 0,
                    prev: 0,
                    next: null,
                    last: null,
                    pageNo: 2,
                    totalPage: 2,
                    perPage: mockPerPage,
                    startRecord: 5,
                    endRecord: 6,
                    totalRecord: mockList.length,
                    ltSpread: null,
                    rtSpread: null,
                    maxSpread: 3,
                });
            });
        });
    });

    describe('Method: getDefState - Get Default Pagination state where there is only one page', () => {
        beforeEach(() => {
            getRecordCtxSpy.mockReturnValue({});
        });

        it('should return default state', () => {
            const mockTotalRecord: number = 0;
            const mockPerPage: number = 1;

            expect(handle.getDefState(mockTotalRecord, mockPerPage)).toEqual({
                perPage: mockPerPage,
                startIdx: 0,
                pageNo: 1,
                totalPage: 1
            });
        });
    });

    describe('Method: createOption - Create a new Pagination option from an option merged with either default or custom existing option', () => {
        const mockOption: Partial<IOption> = { page: 2 };

        it('should return an option merged with default option when existing option is not provided', () => {
            getDefOptionSpy.mockReturnValue({});
            expect(handle.createOption(mockOption)).toEqual(mockOption);
            expect(getDefOptionSpy).toHaveBeenCalled();
        });

        it('should return an option merged with existing option when it is provided', () => {
            const mockExistOption = {} as IOption;
            expect(handle.createOption(mockOption, mockExistOption)).toEqual(mockOption);
            expect(getDefOptionSpy).not.toHaveBeenCalled();
        });
    });

    describe('Method: getDefOption - Get Default Pagination Option', () => {
        it('should have default values', () => {
            expect(handle.getDefOption()).toEqual({
                page: 0,
                increment: [10],
                incrementIdx: 0
            });
        });
    });

    describe('Method: createGenericCmpAttr', () => {

    });

    describe('Method: getRecordCtx - Get Record Context', () => {
        it('should return the record context when total record is 0', () => {
            const mockTotalRecord: number = 0;

            expect(handle.getRecordCtx(mockTotalRecord, 1)).toEqual({
                startRecord: mockTotalRecord,
                endRecord: mockTotalRecord,
                totalRecord: mockTotalRecord
            });
            expect(handle.getRecordCtx(mockTotalRecord, 1, 2)).toEqual({
                startRecord: mockTotalRecord,
                endRecord: mockTotalRecord,
                totalRecord: mockTotalRecord
            });
        });

        it('should return the record context when total record is not 0', () => {
            const mockTotalRecord: number = 1;
            const mockStartIdx: number = 0;
            const mockEndIdx: number = 2;

            expect(handle.getRecordCtx(mockTotalRecord, mockStartIdx)).toEqual({
                startRecord: mockStartIdx+1,
                endRecord: mockTotalRecord,
                totalRecord: mockTotalRecord
            });
            expect(handle.getRecordCtx(mockTotalRecord, mockStartIdx, mockEndIdx)).toEqual({
                startRecord: mockStartIdx+1,
                endRecord: mockEndIdx,
                totalRecord: mockTotalRecord
            });
        });
    });

    describe('Method: getNoPerPage - Get the total per page', () => {
        const mockIncrm: number[] = [1,2,3];
        const fallbackVal: number = 1;
        const mockIncrmIdx: number = 0;

        it('should return the provided increment value if the provided increment is valid', () => {
            expect(handle.getNoPerPage(mockIncrm, mockIncrmIdx, fallbackVal)).toEqual(mockIncrm[mockIncrmIdx]);
        });

        it('should return the fallback increment value if no increments are provided', () => {
            expect(handle.getNoPerPage([], mockIncrmIdx, fallbackVal)).toEqual(fallbackVal);
        });

        it('should return the fallback increment value if the provided increment is negative number', () => {
            const mockIncrmVal: number = -1;
            expect(handle.getNoPerPage([mockIncrmVal], 0, fallbackVal)).toEqual(fallbackVal);
        });

        it('should return the fallback increment value if the provided increment does not exist', () => {
            expect(handle.getNoPerPage(mockIncrm, 10, fallbackVal)).toEqual(fallbackVal);
        });
    });

    describe('Method: parseNoPerPage - Parse the total per page', () => {
        it('should parse the increment values by removing any negative increment value', () => {
            expect(handle.parseNoPerPage([1,-1,3])).toEqual([1,3]);
            expect(handle.parseNoPerPage([1,2])).toEqual([1,2]);
        });
    });

    describe('Method: getTotalPage - Get total no. of pages available based on total per page', () => {
        const mockNoPerPage: number = 2;

        it('should return a rounded total no. of pages if total list items is greater than total per page', () => {
            const mockListLen: number = 3;
            expect(handle.getTotalPage(mockListLen, mockNoPerPage)).toBe(2);
        });

        it('should return 1 if total list items is lte total per page', () => {
            const mockListLen: number = 1;
            expect(handle.getTotalPage(mockListLen, mockNoPerPage)).toBe(1);
        });
    });

    describe('Method: getCurrPage - Get a validated/parsed value for current page index and current page number', () => {
        it('should return the parsed current page if its within allowed range', () => {
            expect(handle.getCurrPage(1, 2)).toEqual({curr: 1, pageNo: 2});
        });

        it('should return default value 0 if the current page isnt within allowed range', () => {
            expect(handle.getCurrPage(-1, 2)).toEqual({curr: 0, pageNo: 1});
            expect(handle.getCurrPage(3, 2)).toEqual({curr: 0, pageNo: 1});
        });
    });

    describe('Method: getRelPage - Get the index for relevant pages based on the current page and total number of page', () => {
        const mockTotalPage: number = 2;
        const mockCurrPage: number = 0;

        it('should return the index for relevant pages', () => {
            expect(handle.getRelPage(mockTotalPage, mockCurrPage)).toEqual({
                first: 0,
                prev: -1,
                next: 1,
                last: 1
            });
        });
    });

    describe('Method: getRealPageCtx - Check if relevant pages are valid based on their context', () => {
        const mockPageRang: IPageRange = {curr: 0, last: 0};
        const mockRelPage: IRelPage = { first: 1, prev: 1, next: 1, last: 1 };

        it('should return relevant page with false value if it is valid (i.e. navigatable to that page)', () => {
            canNavToPageSpy.mockReturnValue(true);

            expect(handle.getRelPageCtx(mockPageRang, mockRelPage)).toEqual({
                first: true, prev: true, next: true, last: true
            });
        });

        it('should return relevant page with false value if it is invalid (i.e. unnavigatable to that page)', () => {
            canNavToPageSpy.mockReturnValue(false);

            expect(handle.getRelPageCtx(mockPageRang, mockRelPage)).toEqual({
                first: false, prev: false, next: false, last: false
            });
        });
    });

    describe('Method: parseRelPage - Parse the value for the relevant pages if they are invalid', () => {
        const mockRelPage: IRelPage = { first: 1, prev: 1, next: 1, last: 1 };
        const mockRelPageCtx: IRelPageCtx = { first: true, prev: true, next: true, last: false };

        it('should pasrse the and replaced the invalid value of relevant pages to be undefined', () => {
            expect(handle.parseRelPage(mockRelPage, mockRelPageCtx)).toEqual({...mockRelPage, last: null});
        });
    });

    describe('Method: getPageSliceIdx - Get the corresponding slice index for `slice` in the list array based on a provided page index', () => {
        const mockList: any[] = [];
        const mockPerPage: number = 2;
        const mockPage: number = 1;
        let slice: IPageSlice

        it('should return the index if it exists in the list array', () => {
            isDefinedSpy.mockReturnValue(true);
            slice = handle.getPageSliceIdx(mockList, mockPerPage, mockPage);

            expect(slice).toEqual({startIdx: 2, endIdx: 4});
        });

        it('should return the index if it doesnt exist in the list array', () => {
            isDefinedSpy.mockReturnValue(false);
            slice = handle.getPageSliceIdx(mockList, mockPerPage, mockPage);

            expect(slice).toEqual({startIdx: undefined, endIdx: undefined});
        });
    });

    describe('Method: getSpreadCtx - Get the page index for the left and right spread in relation to current page', () => {
        const { getSpreadCtx } = PgnHandle.prototype;
        const totalPage: number = 10;

        it('should return spread context with max spread of default 3 pages', () => {
            expect(getSpreadCtx(1, totalPage)).toEqual({
                ltSpread: null,
                rtSpread: [2,3,4,'...'],
                maxSpread: 3
            });

            expect(getSpreadCtx(2, totalPage)).toEqual({
                ltSpread: null,
                rtSpread: [3,4,5,'...'],
                maxSpread: 3
            });

            expect(getSpreadCtx(3, totalPage)).toEqual({
                ltSpread: [2],
                rtSpread: [4,5,6,'...'],
                maxSpread: 3
            });

            expect(getSpreadCtx(7, totalPage)).toEqual({
                ltSpread: ['...',4,5,6],
                rtSpread: [8,9],
                maxSpread: 3
            });

            expect(getSpreadCtx(10, totalPage)).toEqual({
                ltSpread: ['...',7,8,9],
                rtSpread: null,
                maxSpread: 3
            });
        });

        it('should return spread context with max spread of custom pages', () => {
            const customMaxSpread: number = 5;

            expect(getSpreadCtx(1, totalPage, customMaxSpread)).toEqual({
                ltSpread: null,
                rtSpread: [2,3,4,5,6,'...'],
                maxSpread: 5
            });

            expect(getSpreadCtx(7, totalPage, customMaxSpread)).toEqual({
                ltSpread: [2,3,4,5,6],
                rtSpread: [8,9],
                maxSpread: 5
            });

            expect(getSpreadCtx(8, totalPage, customMaxSpread)).toEqual({
                ltSpread: ['...',3,4,5,6,7],
                rtSpread: [9],
                maxSpread: 5
            });
        });
    });

    describe('Method: canNavToPage - Check if a requested page can be navigated to', () => {
        // Aassume 3 pages
        const PAGE1: number = 0;
        const PAGE2: number = 1;
        const PAGE3: number = 2;
        const mockCurrPage1: IPageRange = {last: PAGE3, curr: PAGE1 };
        const mockCurrPage2: IPageRange = {last: PAGE3, curr: PAGE2 };
        const mockCurrPage3: IPageRange = {last: PAGE3, curr: PAGE3 };

        beforeEach(() => {
            isGteZeroSpy.mockReturnValue(true);
        });

        describe('check if page is valid', () => {
            it('should return false if current page or last page is less than 0', () => {
                isGteZeroSpy.mockReturnValue(false);

                expect(handle.canNavToPage(mockCurrPage1, {type: ''})).toBe(false);
                expect(isGteZeroSpy).toHaveBeenCalledWith([PAGE1, PAGE3]);
                expect(isGteZeroSpy).toHaveBeenCalledTimes(1);
            });

            it('should return false if requested page type does not match', () => {
                expect(handle.canNavToPage(mockCurrPage1, {type: ''})).toBe(false);
                expect(isGteZeroSpy).toHaveBeenCalledTimes(1);
                expect(isDefinedSpy).not.toHaveBeenCalled();
            });
        });

        describe('check if there is previous page', () => {
            it('should return true if previous page index is gte 0 and lt current page index', () => {
                expect(handle.canNavToPage(mockCurrPage2, {type: 'prev', target: PAGE3-1})).toBe(true);
            });

            it('should return false if previous page index is lt 0 or gte to current page index', () => {
                expect(handle.canNavToPage(mockCurrPage1, {type: 'prev', target: PAGE1-1})).toBe(false);
            });
        });

         describe('check if there is next page', () => {
            it('should return true if next page index gt current page index and lte last page index', () => {
                expect(handle.canNavToPage(mockCurrPage1, {type: 'next', target: PAGE1+1})).toBe(true);
            });

            it('should return false if next page index lte last page index', () => {
                expect(handle.canNavToPage(mockCurrPage3, {type: 'next', target: PAGE3+1})).toBe(false);
            });
        });

        describe('check if there is first page', () => {
            const mockTargetFirstPage: IPageNavQuery = {type: 'first', target: 0};

            it('should return true if current page index is not 0 and first page index is lt current page index', () => {
                expect(handle.canNavToPage(mockCurrPage2, mockTargetFirstPage)).toBe(true);
            });

            it('should return false if current page index is 0 or first page index is gte than current page index', () => {
                expect(handle.canNavToPage(mockCurrPage1, mockTargetFirstPage)).toBe(false);
            });
        });

        describe('check if there is last page', () => {
            const mockTargetLastPage: IPageNavQuery = {type: 'last', target: PAGE3};

            it('should return true if last page index is gt current page index', () => {
                expect(handle.canNavToPage(mockCurrPage1, mockTargetLastPage)).toBe(true);
            });

            it('should return false if last page index is lte current page index', () => {
                expect(handle.canNavToPage(mockCurrPage3, mockTargetLastPage)).toBe(false);
            });
        });

        describe('check if there is a specific page index', () => {
            it('should return true if the page index is a number gte 0, not same as current page index and lte last page index', () => {
                expect(handle.canNavToPage(mockCurrPage1, {type: 'page',target: PAGE2})).toBe(true);
                expect(handle.canNavToPage(mockCurrPage2, {type: 'page',target: PAGE1})).toBe(true);
            });

            it('should return false if the page index is same as current page index', () => {
                expect(handle.canNavToPage(mockCurrPage1, {type: 'page',target: PAGE1})).toBe(false);
            });

            it('should return false if the page index is gt last page index', () => {
                expect(handle.canNavToPage(mockCurrPage1, {type: 'page',target: 4})).toBe(false);
            });
        });
    });

    describe('Method: isDefined - Check if a value is define', () => {
        it('should return true if value is defined', () => {
            expect(handle.isDefined('')).toBe(true);
        });

        it('should return false if value isnt defined', () => {
            expect(handle.isDefined()).toBe(false);
        });
    });

    describe('Method: isGteZero - Check if a value or an array of value is an interger and also greater or equal to 0', () => {
        it('should return true if it or all of the values are an interger and gte 0', () => {
            expect(handle.isGteZero(1)).toBe(true);
            expect(handle.isGteZero([1, 2])).toBe(true);
        });

        it('should return false if it or one of the values isnt an interger or gte 0', () => {
            expect(handle.isGteZero(-1)).toBe(false);
            expect(handle.isGteZero(1.1)).toBe(false);
            expect(handle.isGteZero([0, -1])).toBe(false);
            expect(handle.isGteZero([0, 1.1])).toBe(false);
        });
    });
});