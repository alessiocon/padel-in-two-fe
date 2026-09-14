import React, { useState, type ButtonHTMLAttributes, type FC, type InputHTMLAttributes } from 'react';
import style from './form.module.css';

// Tipo per la configurazione di un campo
export interface InputProps extends InputHTMLAttributes<HTMLInputElement>{
    value: [any, React.Dispatch<React.SetStateAction<any>>];
    labelText?: string;
    id?: string;
    name: string;
    addClass: string;
}
export interface formButton {
    action: React.MouseEventHandler<HTMLButtonElement>;
    label: string;
    addClass?:string;
    type?: ButtonHTMLAttributes<HTMLButtonElement>['type'];

}

export interface FormProps extends React.FormHTMLAttributes<HTMLFormElement>{
    addClass?: string;
    buttons: formButton[];
    children: React.ReactNode;
}



const DynamicInput: FC<InputProps> = ({
    value: [inputValue, setInputValue],
    labelText,
    name,
    id,
    addClass,
    ...rest
}) => {
    return (
        <div className={`${style['form-field']} ${addClass || ""}`}>
            {<label htmlFor={id ?? name} className="form-label">{labelText ?? name}</label>}
            <input
                id={id ?? name}
                name={name}
                // value={inputValue}
                // onChange={(e) => setInputValue(e.target.value)}
                className="form-input"
                {...rest}
            />
        </div>
    );
}


const DynamicForm : FC<FormProps> = ({
  children,
  addClass,
  buttons,
  onSubmit: onCustomSubmit,
}) => {
  

//   const [formData, setFormData] = useState<Partial<T>>(initialData);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});

//   const handleChange = (field: keyof T, value: any) => {
//     setFormData(prev => ({
//       ...prev,
//       [field]: value
//     }));
    
//     // Pulisci l'errore quando l'utente modifica il campo
//     if (errors[field]) {
//       setErrors(prev => {
//         const newErrors = { ...prev };
//         delete newErrors[field];
//         return newErrors;
//       });
//     }
//   };

//   const validate = (): boolean => {
//     const newErrors: Partial<Record<keyof T, string>> = {};
    
//     Object.keys(config).forEach((key) => {
//       const fieldKey = key as keyof T;
//       const fieldConfig = config[fieldKey];
//       const value = formData[fieldKey];

//       if (fieldConfig.required && (value === undefined || value === '' || value === null)) {
//         newErrors[fieldKey] = `${fieldConfig.label} è obbligatorio`;
//       }

//       if (fieldConfig.type === 'number' && value !== undefined && value !== '') {
//         const numValue = Number(value);
//         if (isNaN(numValue)) {
//           newErrors[fieldKey] = `${fieldConfig.label} deve essere un numero`;
//         } else {
//           if (fieldConfig.min !== undefined && numValue < fieldConfig.min) {
//             newErrors[fieldKey] = `${fieldConfig.label} deve essere almeno ${fieldConfig.min}`;
//           }
//           if (fieldConfig.max !== undefined && numValue > fieldConfig.max) {
//             newErrors[fieldKey] = `${fieldConfig.label} non può superare ${fieldConfig.max}`;
//           }
//         }
//       }
//     });

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSubmit = async (e: React.SubmitEvent) => {
//     e.preventDefault();
    
//     if (!validate()) {
//       return;
//     }

//     setIsSubmitting(true);
    
//     try {
//       await onSubmit(formData as T);
      
//       if (resetOnSubmit) {
//         setFormData(initialData);
//       }
//     } catch (error) {
//       console.error('Errore durante il submit:', error);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const renderField = (fieldKey: keyof T) => {
//     const fieldConfig = config[fieldKey];
//     const value = formData[fieldKey] ?? '';
//     const error = errors[fieldKey];
//     const fieldName = String(fieldKey);

//     const commonProps = {
//       id: fieldName,
//       name: fieldName,
//       disabled: isSubmitting || fieldConfig.disabled,
//       required: fieldConfig.required,
//       placeholder: fieldConfig.placeholder
//     };

//     let inputElement;

//     // switch (fieldConfig.type) {
//     //   case 'textarea':
//     //     inputElement = (
//     //       <textarea
//     //         {...commonProps}
//     //         value={String(value)}
//     //         onChange={(e) => handleChange(fieldKey, e.target.value)}
//     //         className="form-textarea"
//     //       />
//     //     );
//     //     break;

//     //   case 'select':
//     //     inputElement = (
//     //       <select
//     //         {...commonProps}
//     //         value={String(value)}
//     //         onChange={(e) => handleChange(fieldKey, e.target.value)}
//     //         className="form-select"
//     //       >
//     //         <option value="">Seleziona...</option>
//     //         {fieldConfig.options?.map((option, index) => (
//     //           <option key={index} value={option}>
//     //             {option}
//     //           </option>
//     //         ))}
//     //       </select>
//     //     );
//     //     break;

//     //   case 'number':
//     //     inputElement = (
//     //       <input
//     //         {...commonProps}
//     //         type="number"
//     //         value={value === '' ? '' : Number(value)}
//     //         onChange={(e) => handleChange(fieldKey, e.target.value === '' ? '' : Number(e.target.value))}
//     //         min={fieldConfig.min}
//     //         max={fieldConfig.max}
//     //         className="form-input"
//     //       />
//     //     );
//     //     break;

//     //   case 'date':
//     //     inputElement = (
//     //       <input
//     //         {...commonProps}
//     //         type="date"
//     //         value={value ? new Date(value).toISOString().split('T')[0] : ''}
//     //         onChange={(e) => handleChange(fieldKey, e.target.value ? new Date(e.target.value) : '')}
//     //         className="form-input"
//     //       />
//     //     );
//     //     break;

//     //   default:
//     //     inputElement = (
//     //       <input
//     //         {...commonProps}
//     //         type={fieldConfig.type}
//     //         value={String(value)}
//     //         onChange={(e) => handleChange(fieldKey, e.target.value)}
//     //         className="form-input"
//     //       />
//     //     );
//     // }

//     return (
//       <div key={fieldName} className="form-field">
//         <label htmlFor={fieldName} className="form-label">
//           {fieldConfig.label}
//           {fieldConfig.required && <span className="required">*</span>}
//         </label>
//         {inputElement}
//         {error && <span className="form-error">{error}</span>}
//       </div>
//     );
//   };

    return (
    <form onSubmit={onCustomSubmit} className={`${style.form} ${addClass || ""}`}>
        {children}
        <div className='containerBtn'>
            {buttons.map(({ action, label, type, addClass }, index) => (
                <button 
                    key={index}
                    type={type || "button"}
                    className={`btn ${addClass || ""}`}
                    onClick={(e) => action(e)}
                >
                    {label}
                </button>
            ))}
        </div>

    </form>
    );
}

export {DynamicForm, DynamicInput};
