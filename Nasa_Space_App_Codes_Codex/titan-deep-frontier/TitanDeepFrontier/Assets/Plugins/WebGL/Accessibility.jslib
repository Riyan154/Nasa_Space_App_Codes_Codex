mergeInto(LibraryManager.library, {
  TitanLabels: function(json) {
    var payload = JSON.parse(UTF8ToString(json)); var labels = payload.labels;
    var panel = document.getElementById('accessible-controls');
    if (!panel) return;
    panel.replaceChildren(); var description=document.createElement('p');description.textContent=payload.description;description.setAttribute('role','status');panel.appendChild(description);
    labels.forEach(function(label, i) {
      var button = document.createElement('button'); button.textContent = label;
      button.onclick = function() { window.titanInstance.SendMessage('Titan Game', 'AccessibleActivate', String(i)); };
      panel.appendChild(button);
    });
  },
  TitanPreferences: function() {
    setTimeout(function() {
      if(window.titanInstance) window.titanInstance.SendMessage('Titan Game', 'SystemReducedMotion', String(matchMedia('(prefers-reduced-motion: reduce)').matches));
    }, 500);
  }
});
