"use-strict";

const File = require("file").File;
const cfg = require("config");
const assert = require("assert");
const opt = require("getopt");
const console = require("console");
const models = require("./models");

var KarooGenerator = function (configDump)
{
  this.config = {};
  this.content = "";
  if (typeof configDump === "string")
  {
    this.readConfig(configDump);
  }
}

KarooGenerator.prototype.readConfig = function(file)
{
  this.config = {};
  this.content = "";

  var reader = new File();
  if(reader.open(file, "r"))
  {
    while (!reader.eof())
    {
      var line = reader.readLine();
      if (typeof line !== "undefined")
      {
        this.content += line;
      }
    }
  
    this.config = JSON.parse(this.content);
    reader.close();
  }
  
}

KarooGenerator.prototype.generate = function(path)
{
  models.generate(this.config, path);
}

var karooGenerator = new KarooGenerator(opt.argv[2]);
karooGenerator.generate(opt.argv[3]);