var OpenAgBlocks = function (runtime) {
  /**
   * The runtime instantiating this block package.
   * @type {Runtime}
   */
  this.runtime = runtime;
}

/**
 * Retrieve the block primitives implemented by this package.
 * @return {Object.<string, Function>} Mapping of opcode to Function.
 */
OpenAgBlocks.prototype.getPrimitives = function () {
  return {
    openag_getenvvar: this.getEnvVar
  }
}

OpenAgBlocks.prototype.getEnvVar = function(args, util) {

}

module.exports = OpenAgBlocks;