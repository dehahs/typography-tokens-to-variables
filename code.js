"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const fontMapping = {
    'system-ui': 'Inter' // Map system-ui to Inter
};
figma.showUI(__html__, { width: 400, height: 300 });
figma.ui.onmessage = (msg) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    if (msg.type === 'import-tokens') {
        try {
            console.log('Received message:', msg);
            if (!msg.tokens) {
                throw new Error('No tokens data received');
            }
            const tokens = JSON.parse(msg.tokens);
            console.log('Full tokens object:', JSON.stringify(tokens, null, 2));
            if (!tokens['type styles']) {
                throw new Error('Invalid tokens structure');
            }
            // Create a collection for typography variables
            const collection = figma.variables.createVariableCollection('Typography');
            console.log('Created collection:', collection);
            // Process each typography token
            const typeStyles = tokens['type styles'];
            console.log('Processing type styles:', typeStyles);
            for (const [name, token] of Object.entries(typeStyles)) {
                console.log('-------------------');
                console.log('Processing token name:', name);
                console.log('Token data:', JSON.stringify(token, null, 2));
                console.log('Token value:', token.$value);
                console.log('Token fontSize:', (_a = token.$value) === null || _a === void 0 ? void 0 : _a.fontSize);
                console.log('Token fontFamily:', (_b = token.$value) === null || _b === void 0 ? void 0 : _b.fontFamily);
                if (!token || !token.$value || !token.$value.fontSize || !token.$value.fontFamily) {
                    console.log('❌ Invalid token structure for:', name);
                    console.log('Missing properties:');
                    if (!token)
                        console.log('- token is null/undefined');
                    if (!token.$value)
                        console.log('- $value is missing');
                    if (!((_c = token.$value) === null || _c === void 0 ? void 0 : _c.fontSize))
                        console.log('- fontSize is missing');
                    if (!((_d = token.$value) === null || _d === void 0 ? void 0 : _d.fontFamily))
                        console.log('- fontFamily is missing');
                    continue;
                }
                try {
                    // Map the font family and load it
                    const fontFamily = fontMapping[token.$value.fontFamily] || token.$value.fontFamily;
                    yield figma.loadFontAsync({
                        family: fontFamily,
                        style: "Regular"
                    });
                    // Create text style
                    const style = figma.createTextStyle();
                    style.name = name;
                    // Set font family
                    style.fontName = {
                        family: fontFamily,
                        style: 'Regular'
                    };
                    // Create variables for each property
                    // Add font family variable (new!)
                    const fontFamilyVar = figma.variables.createVariable(`fontFamily/${name}`, collection, 'STRING');
                    fontFamilyVar.setValueForMode(collection.defaultModeId, fontFamily);
                    // Set font size
                    const fontSize = token.$value.fontSize.value;
                    console.log('Raw font size:', fontSize);
                    if (!isNaN(fontSize)) {
                        style.fontSize = fontSize;
                        // Create variable for fontSize
                        const fontSizeVar = figma.variables.createVariable(`fontSize/${name}`, collection, 'FLOAT');
                        fontSizeVar.setValueForMode(collection.defaultModeId, fontSize);
                        console.log('Created variable:', fontSizeVar);
                    }
                    // Add letter spacing variable
                    const letterSpacingVar = figma.variables.createVariable(`letterSpacing/${name}`, collection, 'FLOAT');
                    letterSpacingVar.setValueForMode(collection.defaultModeId, token.$value.letterSpacing.value);
                    // Add line height variable
                    const lineHeightVar = figma.variables.createVariable(`lineHeight/${name}`, collection, 'FLOAT');
                    lineHeightVar.setValueForMode(collection.defaultModeId, token.$value.lineHeight);
                    // Add font weight variable
                    const fontWeightVar = figma.variables.createVariable(`fontWeight/${name}`, collection, 'FLOAT');
                    fontWeightVar.setValueForMode(collection.defaultModeId, token.$value.fontWeight);
                    console.log('Successfully created style and variables for:', name);
                }
                catch (innerError) {
                    console.error('Error processing token:', name, innerError);
                    continue;
                }
            }
            figma.notify('Typography tokens imported successfully!');
        }
        catch (error) {
            console.error('Full error:', error);
            console.error('Error stack:', error.stack);
            figma.notify('Error importing tokens: ' + error.message);
        }
    }
});
