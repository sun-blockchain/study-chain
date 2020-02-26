module.exports = function(otherArray) {
  return function(current) {
    return (
      otherArray.filter(function(other) {
        return other.CourseID == current.CourseID;
      }).length == 0
    );
  };
};
