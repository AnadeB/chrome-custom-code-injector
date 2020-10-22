import React from 'react';
import { MemoComponent } from '../../extendable/memo-component';
import { inclStaticIcon } from '../../static/icon';
import { IProps, IState, IValidationConfig, ICallback, TValidState } from './type';

export class TextInput extends MemoComponent<IProps, IState> {
    readonly BASE_CLS: string = 'text-ipt';
    inputElem: HTMLInputElement;

    constructor(props: IProps) {
        super(props);
        const { validate } = this.props;
        this.state = this.getInitialState(validate);
        this.onChange = this.onChange.bind(this);
        this.onBlur = this.onBlur.bind(this);
    }

    /**
     * Revalidate when passed validation rules have changed
     */
    UNSAFE_componentWillReceiveProps({defaultValue, validate}: IProps): void {
        const { props } = this;
        const isSameRules: boolean = props.validate === validate;

        // We dont care about if other props change except for the passed text and validation rules
        if (isSameRules) return;

        // Only Revalidate & Update internal state when the passed Validation rules have changed
        const state: IState = this.getInitialState(validate);
        const validateText: string = defaultValue as string ?? this.inputElem.value;
        const validState: TValidState = state.hsValidationRules ? this.getValidState(validateText, validate) : {} as TValidState;
        this.setState({...state, ...validState});
    }

    render() {
        const { BASE_CLS, cssCls } = this;
        const { id, label, onInputChange, onInputBlur, validate, ...inputProps } = this.props;
        const { isValid, hsValidationRules, errMsg } = this.state;
        const hsValidState: boolean = hsValidationRules && (isValid !== null);
        const validateCls: string = hsValidState ? (isValid ? 'valid' : 'invalid') : '';
        const className: string = cssCls(BASE_CLS, (label ? 'label' : '') + ` ${validateCls}`);

        return (
            <div className={className}>{ label &&
                <label htmlFor={id}>{label}</label>}
                <div className="text-ipt__input">
                    <input
                        id={id}
                        type="text"
                        ref={elem => this.inputElem = elem}
                        onChange={this.onChange}
                        onBlur={this.onBlur}
                        {...inputProps}
                        />
                    { hsValidState && isValid && inclStaticIcon('valid') }
                </div>{ hsValidState && !isValid &&
                <ul className="text-ipt__err">{ errMsg.map((msg, idx) =>
                    <li key={`text-ipt__err-msg-${idx}`}>{msg}</li>)}
                </ul>}
            </div>
        );
    }

    getInitialState(validate: IValidationConfig[]): IState {
        return {
            hsValidationRules: validate?.length > 0,
            isValid: null,
            errMsg: []
        };
    }

    getValidState(text: string, rules: IValidationConfig[]): TValidState {
        const errMsg: string[] = [];
        rules.forEach(({rule, msg}: IValidationConfig) => {
            let isValid: boolean = true;

            if (typeof rule === 'function') {
                isValid = rule(text);

            } else if (rule instanceof RegExp) {
                isValid = text.search(rule) !== -1;
            }

            if (!isValid) errMsg.push(msg);
        });
        return {
            isValid: !errMsg.length,
            errMsg
        };
    }

    setValidState(evt: React.ChangeEvent<HTMLInputElement>, evtCbFn: (arg: ICallback) => void, charLimit: number): void {
        const { validate } = this.props;
        const { isValid, hsValidationRules } = this.state;
        const val: string = evt.target.value;

        // Get validate state anyway
        const validState: TValidState = hsValidationRules ? this.getValidState(val, validate) : null;

        // Only set validate state only when there r validation rules & either of the following:
        // - when its 1st time focus & there r more than or eq. to 3 characters + validation rules exist
        // - when its blurred (regardless of character limit, i.e. `charLimit=0`) + validation rules exist
        const isFitForValidation: boolean = hsValidationRules && ((isValid === null && val.length >= charLimit) || isValid !== null);
        if (isFitForValidation) this.setState({...this.state, ...validState});

        // handle two way binding internally if needed for external state
        evtCbFn?.({
            evt,
            val,
            isGte3: val.length >= 3,
            validState
        });
    }

    //// EVENT HANDLE ////
    onChange(evt: React.ChangeEvent<HTMLInputElement>): void {
        this.setValidState(evt, this.props.onInputChange, 3);
    }

    onBlur(evt: React.ChangeEvent<HTMLInputElement>): void {
        this.setValidState(evt, this.props.onInputBlur, 0);
    }
}