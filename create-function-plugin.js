export default function myPlugin(options) {
    return {
        name: 'create-function-plugin',
        renderChunk(code) {
            return `${options.prepend}\n${code}\n${options.append}`;
        }
    };
}

