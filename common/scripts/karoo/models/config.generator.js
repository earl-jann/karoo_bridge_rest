"use strict"

var cfg = require("config");
var File = require("file").File;

var includeFormatter = function(path)
{
  return "@include \"" + path + "\"";
}

var ConfigGenerator = function(name, includeName, includeFiles)
{
  this.name = name;
  this.includeName = includeName;
  this.includeFiles = includeFiles;
  this.includeSep = "\n";
  
  if(this.includeFiles instanceof Array) {
    this.includeFiles.forEach(function(include, index, array) {
      array[index] = includeFormatter(include);
    });
  }
}

ConfigGenerator.prototype.addIncludeTemplate = function(root) 
{
  if(this.includeName !== undefined) {
    if(this.includeName.length > 0 && this.includeName.trim()) {
      this.includeSep = "\n  ";
      root.getSetting(this.includeName).addString("INCLUDE");
    } else {
      this.includeSep = "\n";
      root.addString("INCLUDE");
    }
  }
}

ConfigGenerator.prototype.updateIncludeTemplate = function(configStr)
{
  if(this.includeFiles instanceof Array && this.includeFiles.length > 0) {
    return configStr.replace("INCLUDE = \"\"", this.includeFiles.join(this.includeSep));
  }

  return configStr;
}

ConfigGenerator.prototype.validate = function(config) {
  /** Do nothing **/
  return true;
}

ConfigGenerator.prototype.writeRoot = function(config, root, configWriter) {
  /** Do nothing **/
}

ConfigGenerator.prototype.generate = function(config, path)
{
  var configWriter = new cfg.Config();
  var root = configWriter.self();
  
  this.writeRoot(config, root, configWriter);

  this.addIncludeTemplate(root);

  var content = this.updateIncludeTemplate(configWriter.toString());
  var fileWriter = new File(path + "/" + this.name, "w+");
  fileWriter.writeLine(content);
  fileWriter.close();
}

module.exports = ConfigGenerator;