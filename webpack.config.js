const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');


module.exports = {
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: 'assets', to: '.' },
        { from: 'manifest.json', to: '.' },
        { from: 'src/frame.html', to: '.' },
      ]
    })
  ],
  entry: {
    contentscript: './src/contentscript.ts',
    framescript: './src/framescript.ts'
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
  },
  mode: 'production',
};
