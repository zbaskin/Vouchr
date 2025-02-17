/***************************************************************************
 * The contents of this file were generated with Amplify Studio.           *
 * Please refrain from making any modifications to this file.              *
 * Any changes to this file will be overwritten when running amplify pull. *
 **************************************************************************/

import * as React from "react";
import { GridProps, SelectFieldProps } from "@aws-amplify/ui-react";
export declare type EscapeHatchProps = {
    [elementHierarchy: string]: Record<string, unknown>;
} | null;
export declare type VariantValues = {
    [key: string]: string;
};
export declare type Variant = {
    variantValues: VariantValues;
    overrides: EscapeHatchProps;
};
export declare type ValidationResponse = {
    hasError: boolean;
    errorMessage?: string;
};
export declare type ValidationFunction<T> = (value: T, validationResponse: ValidationResponse) => ValidationResponse | Promise<ValidationResponse>;
export declare type TicketCollectionCreateFormInputValues = {
    sort?: string;
};
export declare type TicketCollectionCreateFormValidationValues = {
    sort?: ValidationFunction<string>;
};
export declare type PrimitiveOverrideProps<T> = Partial<T> & React.DOMAttributes<HTMLDivElement>;
export declare type TicketCollectionCreateFormOverridesProps = {
    TicketCollectionCreateFormGrid?: PrimitiveOverrideProps<GridProps>;
    sort?: PrimitiveOverrideProps<SelectFieldProps>;
} & EscapeHatchProps;
export declare type TicketCollectionCreateFormProps = React.PropsWithChildren<{
    overrides?: TicketCollectionCreateFormOverridesProps | undefined | null;
} & {
    clearOnSuccess?: boolean;
    onSubmit?: (fields: TicketCollectionCreateFormInputValues) => TicketCollectionCreateFormInputValues;
    onSuccess?: (fields: TicketCollectionCreateFormInputValues) => void;
    onError?: (fields: TicketCollectionCreateFormInputValues, errorMessage: string) => void;
    onChange?: (fields: TicketCollectionCreateFormInputValues) => TicketCollectionCreateFormInputValues;
    onValidate?: TicketCollectionCreateFormValidationValues;
} & React.CSSProperties>;
export default function TicketCollectionCreateForm(props: TicketCollectionCreateFormProps): React.ReactElement;
