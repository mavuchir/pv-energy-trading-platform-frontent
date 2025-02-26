import React from 'react'

export const Table = ({ children, className, ...props }) => {
  return (
    <table className={`w-full text-sm text-left text-gray-500 dark:text-gray-400 ${className}`} {...props}>
      {children}
    </table>
  )
}

export const TableHeader = ({ children, className, ...props }) => {
  return (
    <thead className={`text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 ${className}`} {...props}>
      {children}
    </thead>
  )
}

export const TableBody = ({ children, className, ...props }) => {
  return (
    <tbody className={className} {...props}>
      {children}
    </tbody>
  )
}

export const TableRow = ({ children, className, ...props }) => {
  return (
    <tr className={`bg-white border-b dark:bg-gray-800 dark:border-gray-700 ${className}`} {...props}>
      {children}
    </tr>
  )
}

export const TableHead = ({ children, className, ...props }) => {
  return (
    <th scope="col" className={`px-6 py-3 ${className}`} {...props}>
      {children}
    </th>
  )
}

export const TableCell = ({ children, className, ...props }) => {
  return (
    <td className={`px-6 py-4 ${className}`} {...props}>
      {children}
    </td>
  )
}
