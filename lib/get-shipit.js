module.exports = function getShipit(gruntOrShipit) {
  if (gruntOrShipit.shipit)
    return gruntOrShipit.shipit;

  return gruntOrShipit;
};
