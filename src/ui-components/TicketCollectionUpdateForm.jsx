/***************************************************************************
 * The contents of this file were generated with Amplify Studio.           *
 * Please refrain from making any modifications to this file.              *
 * Any changes to this file will be overwritten when running amplify pull. *
 **************************************************************************/

/* eslint-disable */
import * as React from "react";
import { Button, Flex, Grid, SelectField } from "@aws-amplify/ui-react";
import { fetchByPath, getOverrideProps, validateField } from "./utils";
import { generateClient } from "aws-amplify/api";
import { getTicketCollection } from "../graphql/queries";
import { updateTicketCollection } from "../graphql/mutations";
const client = generateClient();
export default function TicketCollectionUpdateForm(props) {
  const {
    id: idProp,
    ticketCollection: ticketCollectionModelProp,
    onSuccess,
    onError,
    onSubmit,
    onValidate,
    onChange,
    overrides,
    ...rest
  } = props;
  const initialValues = {
    sort: "",
  };
  const [sort, setSort] = React.useState(initialValues.sort);
  const [errors, setErrors] = React.useState({});
  const resetStateValues = () => {
    const cleanValues = ticketCollectionRecord
      ? { ...initialValues, ...ticketCollectionRecord }
      : initialValues;
    setSort(cleanValues.sort);
    setErrors({});
  };
  const [ticketCollectionRecord, setTicketCollectionRecord] = React.useState(
    ticketCollectionModelProp
  );
  React.useEffect(() => {
    const queryData = async () => {
      const record = idProp
        ? (
            await client.graphql({
              query: getTicketCollection.replaceAll("__typename", ""),
              variables: { id: idProp },
            })
          )?.data?.getTicketCollection
        : ticketCollectionModelProp;
      setTicketCollectionRecord(record);
    };
    queryData();
  }, [idProp, ticketCollectionModelProp]);
  React.useEffect(resetStateValues, [ticketCollectionRecord]);
  const validations = {
    sort: [],
  };
  const runValidationTasks = async (
    fieldName,
    currentValue,
    getDisplayValue
  ) => {
    const value =
      currentValue && getDisplayValue
        ? getDisplayValue(currentValue)
        : currentValue;
    let validationResponse = validateField(value, validations[fieldName]);
    const customValidator = fetchByPath(onValidate, fieldName);
    if (customValidator) {
      validationResponse = await customValidator(value, validationResponse);
    }
    setErrors((errors) => ({ ...errors, [fieldName]: validationResponse }));
    return validationResponse;
  };
  return (
    <Grid
      as="form"
      rowGap="15px"
      columnGap="15px"
      padding="20px"
      onSubmit={async (event) => {
        event.preventDefault();
        let modelFields = {
          sort: sort ?? null,
        };
        const validationResponses = await Promise.all(
          Object.keys(validations).reduce((promises, fieldName) => {
            if (Array.isArray(modelFields[fieldName])) {
              promises.push(
                ...modelFields[fieldName].map((item) =>
                  runValidationTasks(fieldName, item)
                )
              );
              return promises;
            }
            promises.push(
              runValidationTasks(fieldName, modelFields[fieldName])
            );
            return promises;
          }, [])
        );
        if (validationResponses.some((r) => r.hasError)) {
          return;
        }
        if (onSubmit) {
          modelFields = onSubmit(modelFields);
        }
        try {
          Object.entries(modelFields).forEach(([key, value]) => {
            if (typeof value === "string" && value === "") {
              modelFields[key] = null;
            }
          });
          await client.graphql({
            query: updateTicketCollection.replaceAll("__typename", ""),
            variables: {
              input: {
                id: ticketCollectionRecord.id,
                ...modelFields,
              },
            },
          });
          if (onSuccess) {
            onSuccess(modelFields);
          }
        } catch (err) {
          if (onError) {
            const messages = err.errors.map((e) => e.message).join("\n");
            onError(modelFields, messages);
          }
        }
      }}
      {...getOverrideProps(overrides, "TicketCollectionUpdateForm")}
      {...rest}
    >
      <SelectField
        label="Sort"
        placeholder="Please select an option"
        isDisabled={false}
        value={sort}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              sort: value,
            };
            const result = onChange(modelFields);
            value = result?.sort ?? value;
          }
          if (errors.sort?.hasError) {
            runValidationTasks("sort", value);
          }
          setSort(value);
        }}
        onBlur={() => runValidationTasks("sort", sort)}
        errorMessage={errors.sort?.errorMessage}
        hasError={errors.sort?.hasError}
        {...getOverrideProps(overrides, "sort")}
      >
        <option
          children="Alphabetical"
          value="ALPHABETICAL"
          {...getOverrideProps(overrides, "sortoption0")}
        ></option>
        <option
          children="Event type"
          value="EVENT_TYPE"
          {...getOverrideProps(overrides, "sortoption1")}
        ></option>
        <option
          children="Event date"
          value="EVENT_DATE"
          {...getOverrideProps(overrides, "sortoption2")}
        ></option>
        <option
          children="Time created"
          value="TIME_CREATED"
          {...getOverrideProps(overrides, "sortoption3")}
        ></option>
      </SelectField>
      <Flex
        justifyContent="space-between"
        {...getOverrideProps(overrides, "CTAFlex")}
      >
        <Button
          children="Reset"
          type="reset"
          onClick={(event) => {
            event.preventDefault();
            resetStateValues();
          }}
          isDisabled={!(idProp || ticketCollectionModelProp)}
          {...getOverrideProps(overrides, "ResetButton")}
        ></Button>
        <Flex
          gap="15px"
          {...getOverrideProps(overrides, "RightAlignCTASubFlex")}
        >
          <Button
            children="Submit"
            type="submit"
            variation="primary"
            isDisabled={
              !(idProp || ticketCollectionModelProp) ||
              Object.values(errors).some((e) => e?.hasError)
            }
            {...getOverrideProps(overrides, "SubmitButton")}
          ></Button>
        </Flex>
      </Flex>
    </Grid>
  );
}
