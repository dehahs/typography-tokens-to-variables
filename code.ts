interface FontSize {
  readonly value: number;
  readonly unit: string;
}

interface LetterSpacing {
  readonly value: number;
  readonly unit: string;
}

interface TypographyValue {
  readonly fontFamily: string;
  readonly fontSize: FontSize;
  readonly fontWeight: number;
  readonly letterSpacing: LetterSpacing;
  readonly lineHeight: number;
}

interface TypographyToken {
  readonly $type: 'typography';
  readonly $value: TypographyValue;
}

interface TokenFile {
  readonly $schema: string;
  readonly 'type styles': {
    [key: string]: TypographyToken;
  };
}

const fontMapping: { [key: string]: string } = {
  'system-ui': 'Inter'  // Map system-ui to Inter
};

figma.showUI(__html__, { width: 400, height: 300 });

figma.ui.onmessage = async (msg) => {
  if (msg.type === 'import-tokens') {
    try {
      console.log('Received message:', msg);
      
      if (!msg.tokens) {
        throw new Error('No tokens data received');
      }

      const tokens: TokenFile = JSON.parse(msg.tokens);
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
        console.log('Token fontSize:', token.$value?.fontSize);
        console.log('Token fontFamily:', token.$value?.fontFamily);
        
        if (!token || !token.$value || !token.$value.fontSize || !token.$value.fontFamily) {
          console.log('❌ Invalid token structure for:', name);
          console.log('Missing properties:');
          if (!token) console.log('- token is null/undefined');
          if (!token.$value) console.log('- $value is missing');
          if (!token.$value?.fontSize) console.log('- fontSize is missing');
          if (!token.$value?.fontFamily) console.log('- fontFamily is missing');
          continue;
        }

        try {
          // Map the font family and load it
          const fontFamily = fontMapping[token.$value.fontFamily] || token.$value.fontFamily;
          
          await figma.loadFontAsync({
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
        } catch (innerError) {
          console.error('Error processing token:', name, innerError);
          continue;
        }
      }
      
      figma.notify('Typography tokens imported successfully!');
    } catch (error: any) {
      console.error('Full error:', error);
      console.error('Error stack:', error.stack);
      figma.notify('Error importing tokens: ' + error.message);
    }
  }
}; 