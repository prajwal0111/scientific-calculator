let isDegreeMode = false;

function appendToDisplay(value) {
    const display = document.getElementById('display');
    display.value += value;
    display.focus();
}

function clearDisplay() {
    const display = document.getElementById('display');
    display.value = '';
    display.focus();
}

function deleteLast() {
    const display = document.getElementById('display');
    display.value = display.value.slice(0, -1);
    display.focus();
}

function moveCursorLeft() {
    const display = document.getElementById('display');
    const pos = display.selectionStart;
    if (pos > 0) {
        display.setSelectionRange(pos - 1, pos - 1);
    }
    display.focus();
}

function moveCursorRight() {
    const display = document.getElementById('display');
    const pos = display.selectionStart;
    if (pos < display.value.length) {
        display.setSelectionRange(pos + 1, pos + 1);
    }
    display.focus();
}

function toggleMode() {
    isDegreeMode = !isDegreeMode;
    document.getElementById('mode-display').textContent = isDegreeMode ? 'DEG' : 'RAD';
    document.getElementById('display').focus();
}

function factorial(n) {
    if (!Number.isInteger(n) || n < 0) return NaN;
    if (n === 0 || n === 1) return 1;
    return n * factorial(n - 1);
}

function calculateResult() {
    const display = document.getElementById('display');
    try {
        let expression = display.value;

        const toRadians = (deg) => deg * Math.PI / 180;
        const toDegrees = (rad) => rad * 180 / Math.PI;

        const allowedMath = {
            sin: x => Math.sin(isDegreeMode ? toRadians(x) : x),
            cos: x => Math.cos(isDegreeMode ? toRadians(x) : x),
            tan: x => Math.tan(isDegreeMode ? toRadians(x) : x),
            asin: x => {
                if (x < -1 || x > 1) return NaN;
                return isDegreeMode ? toDegrees(Math.asin(x)) : Math.asin(x);
            },
            acos: x => {
                if (x < -1 || x > 1) return NaN;
                return isDegreeMode ? toDegrees(Math.acos(x)) : Math.acos(x);
            },
            atan: x => isDegreeMode ? toDegrees(Math.atan(x)) : Math.atan(x),
            log: Math.log,
            exp: Math.exp,
            sqrt: Math.sqrt,
            abs: Math.abs,
            pow: Math.pow,
            PI: Math.PI,
            factorial: factorial
        };

        expression = expression
            .replace(/Math\./g, 'allowedMath.')
            .replace(/factorial\(/g, 'allowedMath.factorial(');

        const evaluate = (expr) => {
            if (expr.includes('allowedMath.asin') || expr.includes('allowedMath.acos') || expr.includes('allowedMath.atan')) {
                const match = expr.match(/(asin|acos|atan)\(([^)]+)\)/);
                if (match) {
                    const arg = new Function('allowedMath', `return ${match[2]}`)(allowedMath);
                    if ((match[1] === 'asin' || match[1] === 'acos') && (arg < -1 || arg > 1)) {
                        throw new Error('Invalid input for asin/acos');
                    }
                }
            }
            if (expr.includes('allowedMath.factorial')) {
                const match = expr.match(/factorial\(([^)]+)\)/);
                if (match) {
                    const arg = new Function('allowedMath', `return ${match[1]}`)(allowedMath);
                    if (!Number.isInteger(arg) || arg < 0) {
                        throw new Error('Invalid input for factorial');
                    }
                }
            }
            if (expr.includes('allowedMath.pow')) {
                const match = expr.match(/pow\(([^)]+)\)/);
                if (match) {
                    const args = match[1].split(',').map(arg => new Function('allowedMath', `return ${arg.trim()}`)(allowedMath));
                    if (args.length !== 2 || args.some(isNaN)) {
                        throw new Error('Invalid arguments for pow');
                    }
                }
            }

            return new Function('allowedMath', `return ${expr}`)(allowedMath);
        };

        const result = evaluate(expression);
        display.value = isNaN(result) || !isFinite(result) ? 'Error' : result;
        display.focus();
    } catch (error) {
        display.value = 'Error';
        display.focus();
    }
}