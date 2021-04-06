import React, { ReactElement } from 'react';
import { MemoComponent } from '../../extendable/memo-component';
import { inclStaticIcon } from '../../static/icon';
import { IProps, IValidationRule, IValidationState } from './type';

export class TextInput extends MemoComponent<IProps> {
    readonly BASE_CLS: string = 'text-ipt';
    readonly $validIcon: ReactElement = inclStaticIcon('valid');
    $input: HTMLInputElement;

    static defaultProps: Partial<IProps> = {
        validation: {}
    };

    constructor(props: IProps) {
        super(props);
        this.onChange = this.onChange.bind(this);
        this.onBlur = this.onBlur.bind(this);
    }

    render() {
        const { BASE_CLS, cssCls, $validIcon } = this;
        const { id, label, onInputChange, onInputBlur, validation, defaultValue,...inputProps } = this.props;
        const { rules, fixedPosErrMsg, isValid, errMsg, } = Object.assign(this.defValidationConfig, validation);

        const showValidation: boolean = this.hsValidation(rules) && typeof isValid === 'boolean';
        const showValidIcon: boolean = showValidation && isValid;
        const showErrMsg: boolean = showValidation && !isValid;

        const validateCls: string = showValidation ? (isValid ? 'valid' : 'invalid') : '';
        const wrapperCls: string = cssCls(BASE_CLS, (label ? 'label' : '') + ` ${validateCls}`);
        const labelCls: string = cssCls(`${BASE_CLS}__label`, inputProps?.required ? 'req' : '');
        const errMsgCls: string = cssCls(`${BASE_CLS}__err`, fixedPosErrMsg ? 'pos-fixed' : '');

        const $errMsgList: ReactElement = showErrMsg && errMsg ? (
            <ul className={errMsgCls}>{ errMsg.map((msg, idx) =>
                <li key={`text-ipt__err-msg-${idx}`}>{msg}</li>)}
            </ul>
        ) : null;

        return (
            <div className={wrapperCls}>{ label &&
                <label className={labelCls} htmlFor={id}>{label}</label>}
                <div className="text-ipt__input">
                    <input
                        /* `key` is used to trigger re-render when `defaultValue` value changes */
                        key={defaultValue as string}
                        id={id}
                        type="text"
                        ref={e => this.$input = e}
                        defaultValue={defaultValue}
                        onChange={this.onChange}
                        onBlur={this.onBlur}
                        {...inputProps}
                        />
                    { showValidIcon && $validIcon }
                    { fixedPosErrMsg && $errMsgList }
                </div>
                { !fixedPosErrMsg && $errMsgList }
            </div>
        );
    }

    // - only when its 1st time focus & there r more than or eq. to 3 characters
    onChange(evt: React.ChangeEvent<HTMLInputElement>): void {
        this.onCallback(evt, this.props.onInputChange, 3);
    }

    // - only when its blurred (regardless of character limit)
    onBlur(evt: React.ChangeEvent<HTMLInputElement>): void {
        this.onCallback(evt, this.props.onInputBlur, 0);
    }

    onCallback(evt: React.ChangeEvent<HTMLInputElement>, cbFn: AFn<void>, charLimit: number): void {
        if (!cbFn) return;

        const { rules } = this.props.validation;
        const val = evt.target.value;
        const isGte3 = val.length >= 3;
        const validState = val.length >= charLimit ? this.getValidState(val, rules) : null;
        cbFn({
            evt: { ...evt },
            val,
            validState,
            isGte3
        });
    }

    getValidState(text: string, rules: IValidationRule[]): IValidationState {
        if (!this.hsValidation(rules)) return;

        const errMsg: string[] = [];
        rules.forEach(({rule, msg}: IValidationRule) => {
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

    hsValidation(rules: IValidationRule[]): boolean {
        return rules?.length > 0;
    }

    get defValidationConfig() {
        return {
            rules: [],
            isValid: null,
            errMsg: [],
            fixedPosErrMsg: true,
        };
    }
}