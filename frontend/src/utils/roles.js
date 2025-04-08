export const roleToClearance = {
    regular: 0,
    cashier: 1,
    manager: 2,
    superuser: 3
  }
  
  export const getClearance = (role) => roleToClearance[role] || 0
  