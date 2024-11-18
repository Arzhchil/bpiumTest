const maskIsValid = mask => {
    if (!mask) {
      return false;
    }
  
    let maskValid = false;
    ["*", "A", "a", 1, "#"].forEach(element => {
      if (mask.includes(element)) {
        maskValid = true;
      }
    });
  
    return maskValid;
  };
  
  export default maskIsValid;
  