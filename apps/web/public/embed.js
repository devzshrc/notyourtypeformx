(function() {
    var scripts = document.querySelectorAll('script[data-schema-form-id]');
    scripts.forEach(function(script) {
        var formId = script.getAttribute('data-schema-form-id');
        if (!formId) return;
        var container = document.createElement('div');
        container.style.width = '100%';
        script.parentNode.insertBefore(container, script);

        var iframe = document.createElement('iframe');
        iframe.src = script.src.replace('/embed.js', '/embed/' + formId);
        iframe.style.width = '100%';
        iframe.style.border = 'none';
        iframe.style.minHeight = '400px';
        iframe.setAttribute('title', 'Schema Form');
        container.appendChild(iframe);

        window.addEventListener('message', function(e) {
            if (e.data && e.data.type === 'schema-form-resize' && e.data.height) {
                iframe.style.height = e.data.height + 'px';
            }
        });
    });
})();
