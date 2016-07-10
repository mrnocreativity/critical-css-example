var postcss = require('postcss'),
	criticalSplit = require('postcss-critical-split'),
	clear = require('clear'),
	css = '',
	fs = require('fs');

function saveCssFile(filepath, cssRoot) {
    console.log('saving');
    fs.writeFileSync(filepath, cssRoot.css);

}

clear();

css = fs.readFileSync('build/css/main.css');

postcss(criticalSplit({
		'output': criticalSplit.output_types.CRITICAL_CSS
	}))
    .process(css, {
        'from': './build/css/main.css',
        'to': './build/css/output.css'
    })
    .then(function(result) {
        saveCssFile("./build/css/output.css", result);
        console.log('file saved');
    });

console.log(criticalSplit.output_types.INPUT_CSS);
