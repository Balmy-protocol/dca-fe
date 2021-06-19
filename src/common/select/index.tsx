import React from 'react';
// import { useMinimalSelectStyles } from '@mui-treasury/styles/select/minimal';
// import Select from '@material-ui/core/Select';
// import { MenuProps } from '@material-ui/core/Menu';
// import MenuItem from '@material-ui/core/MenuItem';
// import FormControl from '@material-ui/core/FormControl';
// import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

// // Original design here: https://github.com/siriwatknp/mui-treasury/issues/540
// interface selectOption {
//   label: string;
//   value: string | number;
// }

// type selectOptionsType = selectOption[];

// interface minimalSelectProps {
//   options: selectOptionsType;
//   onChange: React.Dispatch<React.SetStateAction<string>>;
//   selected: string | number;
// }

// const MinimalSelect = ({ options, selected, onChange }: minimalSelectProps) => {
//   const handleChange = (event: React.ChangeEvent<{ value: string }>) => {
//     onChange(event.target.value);
//   };

//   const minimalSelectClasses = useMinimalSelectStyles();

//   const iconComponent: React.FC<{ className: string }> = ({ className }: { className: string }) => {
//     return <ExpandMoreIcon className={className + ' ' + minimalSelectClasses.icon} />;
//   };

//   // moves the menu below the select input
//   const menuProps: Partial<MenuProps> = {
//     classes: {
//       paper: minimalSelectClasses.paper,
//       list: minimalSelectClasses.list,
//     },
//     anchorOrigin: {
//       vertical: 'bottom',
//       horizontal: 'left',
//     },
//     transformOrigin: {
//       vertical: 'top',
//       horizontal: 'left',
//     },
//     getContentAnchorEl: null,
//   };

//   return (
//     <FormControl>
//       <Select
//         disableUnderline
//         classes={{ root: minimalSelectClasses.select }}
//         IconComponent={iconComponent}
//         value={selected}
//         MenuProps={menuProps}
//         onChange={handleChange}
//       >
//         {options.map(({ label, value }: selectOption) => (
//           <MenuItem key={value} value={value}>
//             {label}
//           </MenuItem>
//         ))}
//       </Select>
//     </FormControl>
//   );
// };

// export default MinimalSelect;

const MinimalSelect = () => <div />;

export default MinimalSelect;
