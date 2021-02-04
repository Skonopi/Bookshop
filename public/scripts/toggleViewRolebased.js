function toggleViewRolebased(role) {
    console.log(role);
    var adminElems = document.getElementsByClassName('admin-only');
    var nonAdminElems = document.getElementsByClassName('non-admin');
    var loggedInElems = document.getElementsByClassName('logged-in');
    var anonymousElems = document.getElementsByClassName('anonymous-only');
    var clientElems = document.getElementsByClassName('client-only');
    if (role == 'admin' || role == 'client') {
      Array.prototype.forEach.call(anonymousElems, function (element) {
        element.style.display = 'none';
      });

      if (role == 'admin') {
        Array.prototype.forEach.call(clientElems, function (element) {
          element.style.display = 'none';
        });
        Array.prototype.forEach.call(nonAdminElems, function (element) {
          element.style.display = 'none';
        });
      } else {
        Array.prototype.forEach.call(adminElems, function (element) {
          element.style.display = 'none';
        });

      }
    } else {
      Array.prototype.forEach.call(adminElems, function (element) {
        element.style.display = 'none';
      });
      Array.prototype.forEach.call(clientElems, function (element) {
        element.style.display = 'none';
      });
      Array.prototype.forEach.call(loggedInElems, function (element) {
        element.style.display = 'none';
      });
    }
  }