# Gemini AI Chat Setup

## Getting Your Free API Key

1. **Visit Google AI Studio**: Go to [https://makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)

2. **Sign in with Google**: Use your Google account to access the AI Studio

3. **Create API Key**: 
   - Click "Create API Key"
   - Choose "Create API Key in new project" or select existing project
   - Copy the generated API key

4. **Add to Environment**: Create a `.env.local` file in your project root and add:
   ```
   GEMINI_API_KEY=your_actual_api_key_here
   ```

## Features

- ✅ **Free Tier**: Gemini 1.5 Flash is free with generous limits
- ✅ **Real AI Responses**: Powered by Google's latest AI model
- ✅ **Chat History**: Maintains conversation context
- ✅ **Error Handling**: Graceful fallbacks if API is unavailable
- ✅ **Typing Indicators**: Shows when AI is thinking

## Model Configuration

- **Model**: `gemini-2.0-flash` (fast and free)
- **Max Tokens**: 1000 (configurable)
- **Temperature**: 0.7 (balanced creativity)

## Usage Limits

- **Free Tier**: 15 requests per minute
- **Daily Limit**: 1500 requests per day
- **Token Limit**: 1M tokens per minute

## Troubleshooting

If you see error messages:
1. Check your API key is correct
2. Verify the `.env.local` file is in the project root
3. Restart your development server after adding the API key
4. Check the browser console for detailed error messages 