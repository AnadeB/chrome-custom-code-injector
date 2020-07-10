import { IUiHandle } from '../../../type/ui-handle';
import { IState, IOption, IPageCtx, IPageSlice, IPageNavQuery, IPageRange, IRelPage, IRelPageCtx, IRecordCtx, ISpreadCtx, TSpreadCtx } from './type';

/**
 * Usage:
 *      const list = ['a', 'b', 'c', 'd'];
 *
 *      const example = pgnHandle.createState(list, {
 *           page: 1,                       // optional starting page index
 *           increment: [100, 200, 300],    // used for <select>'s <option> (default 10 per page, i.e. [10])
 *           incrementIdx: 0,               // i.e. 100 per age
 *      });
 *
 *      const { startIdx, endIdx } = example;
 *      const listFor1stPage = list.slice(startIdx, endIdx);
 */
export class PgnHandle implements IUiHandle {
    createState(list: any[], pgnOption: Partial<IOption>): IState {
        // Merge def. option with User's option
        const defOption: IOption = this.getDefOption();
        const { increment: [defIncrmVal] } = defOption;
        const { page, increment, incrementIdx } = Object.assign(defOption, pgnOption);
        let perPage: number = this.getNoPerPage(increment, incrementIdx, defIncrmVal);

        // Skip if we only have 1 list item OR less than 2 pages
        const totalRecord: number = list.length;
        const defState: IState = this.getDefState(totalRecord, perPage);
        if (totalRecord <= 1) return defState;
        const totalPage: number = this.getTotalPage(totalRecord, perPage);
        if (totalPage <= 1) return defState;

        // Proceed as we have >=2 pages
        const { curr, pageNo }: IPageCtx = this.getCurrPage(page, totalPage - 1);
        const currSlice: IPageSlice = this.getPageSliceIdx(list, perPage, curr);
        const { startIdx, endIdx } = currSlice;
        const recordCtx = this.getRecordCtx(totalRecord, startIdx, endIdx);
        const spreadCtx: ISpreadCtx = this.getSpreadCtx(pageNo, totalPage);
        let relPage: IRelPage = this.getRelPage(totalPage, curr);
        const relPageCtx: IRelPageCtx = this.getRelPageCtx({ curr, last: relPage.last }, relPage);
        relPage = this.parseRelPage(relPage, relPageCtx);

        return { curr, ...relPage, ...currSlice, pageNo, perPage, totalPage, ...recordCtx, ...spreadCtx };
    }

    getDefState(totalRecord: number, perPage: number): IState {
        const startIdx: number = 0;
        const recordCtx: IRecordCtx = this.getRecordCtx(totalRecord, startIdx);
        return {
            ...recordCtx,
            perPage,
            totalPage: 1,
            startIdx,
            pageNo: 1
        } as IState;
    }

    // TODO: Test
    /**
     * Merge the updated option with existing option (either custom or default)
     * e.g. existingOption = this.state.sortOption
     */
    createOption(modOption: Partial<IOption>, existingOption?: IOption): IOption {
        const baseOption = existingOption ? existingOption : this.getDefOption();
        return { ...baseOption, ...modOption };
    }

    getDefOption(): IOption {
        return {
            page: 0,
            increment: [10],
            incrementIdx: 0,
        };
    }

    // TODO: Test, param type
    /**
     * Usage Example for React:
     * const callback = ((modState) => {
     *    this.setState({...this.state, ...modState});
     * }).bind(this);
     *
     * createGenericCmpProps(option, state, data, callback);
     */
    createGenericCmpAttr({ data, option, state, callback }) {
        const { increment, incrementIdx } = option;
        const {
            first, prev, next, last,
            ltSpread, rtSpread, maxSpread,
            pageNo, totalPage,
        } = state;

        const wrapperCallback = ((modOption: Partial<IOption>): void => {
            const pgnOption: IOption = this.createOption(modOption, option);
            const pgnState: IState = this.createState(data, pgnOption);
            if (callback) callback({ pgnOption, pgnState });
        }).bind(this);

        //// Attr. for First/Prev/Next/Last as Button
        const btns = { first, prev, next, last };
        const baseBtns = Object.getOwnPropertyNames(btns).reduce((propsContainer, btnName: string) => {
            const pageIdxNo: number = btns[btnName];
            propsContainer[`${btnName}Btn`] = {
                disabled: !Number.isInteger(pageIdxNo),
                onClick: () => wrapperCallback({
                    page: btns[btnName]
                })
            };
            return propsContainer;
        }, {});

        //// Attr. for Spread as Button
        const ltSpreadBtns = ltSpread ? ltSpread.map((page) => ({
            page,
            onClick: () => wrapperCallback({
                // If the page is not a number, then its likely dots '...' so page is jumped by an interval of `maxSpread`
                // - e.g. maxSpread = 3, pageNo = 6
                // then the page is jumped to 2 (eqv. to page index of 3)
                page: Number.isInteger(page) ? page - 1 : pageNo - maxSpread
            })
        })) : null;
        const rtSpreadBtns = rtSpread ? rtSpread.map((page) => ({
            page,
            onClick: () => wrapperCallback({
                page: Number.isInteger(page) ? page - 1 : pageNo + maxSpread
            })
        })) : null;

        //// Attr. for Spread as Select
        const pageSelect = {
            disabled: totalPage <= 1,
            options: [1, ...(ltSpread ? ltSpread : []), ...(rtSpread ? rtSpread : []), totalPage],
            selectedOptionValue: pageNo,
            selectedOptionIdx: (ltSpread?.length + 1) || 1,
            onClick: () => wrapperCallback({
                page: pageNo - 1
            })
        };

        //// Attr. for Per Page Select
        const perPageSelect = {
            disabled: increment.length <= 1,
            options: increment,
            selectedOptionValue: increment[incrementIdx],
            selectedOptionIdx: incrementIdx,
            onChange: ({ target }) => wrapperCallback({
                page: 0,
                incrementIdx: parseInt(target.value, 10)
            })
        };

        return {
            ...baseBtns,
            ltSpreadBtns,
            rtSpreadBtns,
            perPageSelect,
            pageSelect
        };
    }

    getGenericCmpEvtHandler() {

    }

    getRecordCtx(totalRecord: number, startIdx: number, endIdx?: number): IRecordCtx {
        const hsRecord: boolean = totalRecord >= 1;
        return {
            startRecord: (hsRecord && Number.isInteger(startIdx)) ? startIdx + 1 : 0,
            endRecord: (hsRecord && Number.isInteger(endIdx)) ? endIdx : totalRecord,
            totalRecord
        };
    }

    getNoPerPage(incrms: number[], incrmIdx: number, fallbackVal: number): number {
        const hsIncrms: boolean = !!incrms.length;
        if (!hsIncrms) return fallbackVal;

        const incrm: number = incrms[incrmIdx];
        const isValidIncrm: boolean = Number.isInteger(incrm) && incrm > 0;
        const perPage: number = isValidIncrm ? incrms[incrmIdx] : fallbackVal;
        return perPage;
    }

    parseNoPerPage(incrms: number[]): number[] {
        return incrms.filter((incrm: number) => {
            return Number.isInteger(incrm) && incrm > 0;
        });
    }

    getTotalPage(lsLen: number, perPage: number): number {
        const noOfPage: number = (lsLen > perPage) ? lsLen / perPage : 1;
        return Math.ceil(noOfPage);
    }

    getCurrPage(page: number, lastPage: number): IPageCtx {
        const curr: number = (page >= 0 && page <= lastPage) ? page : 0;
        const pageNo: number = curr + 1;
        return { curr, pageNo };
    }

    getRelPage(totalPage: number, currPage: number): IRelPage {
        return {
            first: 0,
            prev: currPage - 1,
            next: currPage + 1,
            last: totalPage - 1
        };
    }

    getRelPageCtx(pageRange: IPageRange, relPage: IRelPage): IRelPageCtx {
        const relPageKeys = Object.getOwnPropertyNames(relPage) as (keyof IRelPage)[];
        return relPageKeys.reduce((relPageCtx, type: string) => {
            const pageQuery: IPageNavQuery = { type, target: relPage[type] };
            relPageCtx[type] = this.canNavToPage(pageRange, pageQuery);
            return relPageCtx;
        }, {}) as IRelPageCtx;
    }

    parseRelPage(relPage: IRelPage, relPageCtx: IRelPageCtx): IRelPage {
        const relPageKeys = Object.getOwnPropertyNames(relPage) as (keyof IRelPage)[];
        relPageKeys.forEach((pageType: keyof IRelPage) => {
            const page: number = relPage[pageType];
            relPage[pageType] = relPageCtx[pageType] ? page : null;
        });
        return relPage;
    }

    getPageSliceIdx(list: any[], perPage: number, page: number): IPageSlice {
        let startIdx: number = page * perPage;     // inclusive index
        let endIdx: number = startIdx + perPage;      // exclusive index
        startIdx = this.isDefined(list[startIdx]) ? startIdx : undefined;   // `undefined` is used as `null` cant be used as empty value in ES6
        endIdx = this.isDefined(list[endIdx]) ? endIdx : undefined;
        return { startIdx, endIdx };
    }

    /**
     * Get the page number for the left/right spread in relation to current page
     * - When remain < maxSpread, show `maxSpread` no. of pages
     * - When remain > maxSpread, show dots (either on left/right) + `maxSpread` no. of pages
     * - when remain < 1, no spread is available
     *
     * @param maxSpread: max no. of pages for each side of the spread
     */
    getSpreadCtx(currPageNo: number, totalPage: number, maxSpread: number = 3): ISpreadCtx {
        // 1 is added to `spreadRange` in case there is '...' for either 1st/last item
        const spreadRange: any[] = [...Array(maxSpread + 1)];
        const firstPage: number = 1;
        const DOTS = '...';

        const rtTotalRemain: number = totalPage - currPageNo;
        const ltTotalRemain: number = currPageNo - firstPage;
        const hsRtSpread: boolean = rtTotalRemain > 1 && rtTotalRemain < totalPage;
        const hsLtSpread: boolean = ltTotalRemain > 1 && ltTotalRemain < totalPage;

        const rtSpread: TSpreadCtx = hsRtSpread ?
            spreadRange.reduce((container: TSpreadCtx, item, idx: number) => {
                const pageNo: number = currPageNo + idx + 1;

                // We exclude the 1st page or last page since its already available in the Pagination state
                const isInRange: boolean = pageNo > 1 && pageNo < totalPage;

                // Check if there is any pages between "last" page number in this loop and the actual last page
                // - e.g. last page in the loop is: 8 | actual last page is: 10,
                // so we have page 9 in between, which we can use '...' to represent
                const hsGtOnePageTilLastPage: boolean = idx === maxSpread && (totalPage - pageNo) > 1;

                if (isInRange) container.push(hsGtOnePageTilLastPage ? DOTS : pageNo);
                return container;
            }, []) :
            null;

        const ltSpread: TSpreadCtx = hsLtSpread ?
            spreadRange.reduce((container: TSpreadCtx, item, idx: number) => {
                const pageNo: number = currPageNo - idx - 1;
                const isInRange: boolean = pageNo > 1 && pageNo < totalPage;
                const hsGtOnePageTilFirstPage: boolean = idx === maxSpread && (currPageNo - pageNo) > 1;
                if (isInRange) container.unshift(hsGtOnePageTilFirstPage ? DOTS : pageNo);
                return container;
            }, []) :
            null;

        return { ltSpread, rtSpread, maxSpread };
    }

    canNavToPage({ curr, last }: IPageRange, { type, target }: IPageNavQuery): boolean {
        if (!this.isGteZero([curr, last])) return false;

        switch (type) {
            case 'prev':
                // we dont need `target < curr` since we already know `target = curr - 1;`
                return target >= 0;
            case 'next':
                // we dont need `target > curr` since we already know `target = curr + 1;`
                return target <= last;
            case 'first':
                // we dont need `target > curr` since we already know `target = 0`
                return curr !== 0 && target < curr;
            case 'last':
                return target > curr;
            case 'page':
                // i.e. any prev or next
                return this.isGteZero(target) && target !== curr && target <= last;
            default:
                return false;
        }
    }

    isDefined(val?: any): boolean {
        return typeof val !== 'undefined';
    }

    isGteZero(vals: any | any[]): boolean {
        return Array.isArray(vals) ?
            vals.every((val: any) => (Number.isInteger(val) && val >= 0)) :
            Number.isInteger(vals) && vals >= 0;
    }
}