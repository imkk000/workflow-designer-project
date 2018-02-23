import hash from 'string-hash'
import Arrow from './arrow'
import MoveObject from './moveoject';
import Contextmenu from './contextmenu'

export default class Canvas {
  constructor(id = 'canvas', width = 500, height = 500) {
    this.canvas = new fabric.Canvas(id, {
      width: width,
      height: height,
      selection: false,
      targetFindTolerance: 15,
      preserveObjectStacking: true,
      perPixelTargetFind: true
    })
    
    fabric.Object.prototype.originX = fabric.Object.prototype.originY = 'center'
    fabric.Object.prototype.hoverCursor = 'pointer'
    fabric.Object.prototype.objectCaching = false // fix cant select object
    fabric.Object.prototype.hasControls = fabric.Object.prototype.hasBorders = false
    fabric.Arrow = Arrow
    
    this.id = id
    this.hashTable = []

    this.contextMenu = new Contextmenu(this)
    this.moveObject = new MoveObject(this)
  }

  _e() {
    this.unlockMovement()
    this.enableMoveObject()
    this.enableContextMenu()
  }

  _d() {
    this.lockMovement()
    this.disableMoveObject()
    this.disableContextMenu()
  }

  createNode(name = 'Undefined', fill = '#fff', left = 0, top = 0, limitInput = 1, settings = {}) {
    const node = [
      new fabric.Circle({
        type: 'circle',
        radius: 35,
        fill: fill,
        stroke: '#000',
        strokeWidth: 2
      }),
      new fabric.Text(name, {
        type: 'text',
        fontFamily: 'sans-serif',
        fontSize: 10,
        fill: '#000'
      })
    ]

    return new fabric.Group(node, {
      level: 1,
      type: 'node',
      id: this.generateId(),
      name: name,
      left: left,
      top: top,
      limitInput: limitInput,
      countInput: 0,
      lines: [],
      settings: settings
    })
  }

  addObject(...object) {
    if (_.isNil(object)) return
    _.forEach(object, (val) => {
      this.canvas.add(val)
    })
  }

  removeObject(...object) {
    if (_.isNil(object)) return
    _.forEach(object, (val) => {
      if (val.type === 'node' || val.type === 'arrow_line')
        _.pull(this.hashTable, val.id)
      this.canvas.remove(val)
    })
  }

  generateId() {
    let id
    do
      id = hash(_.toString(_.random(9999990, true))) 
    while(_.some(this.hashTable, id))

    this.hashTable.push(id)
    return id
  }

  createLine(points = [0, 0, 0, 0], color = '#000', beginNode = null, endNode = null) {
    if (_.isNil(beginNode) || _.isNil(endNode)) return
    const arrow = new fabric.Arrow(points, {
      level: 0,
      type: 'arrow_line',
      name: 'arrow_line',
      id: this.generateId(),
      strokeWidth: 4,
      stroke: color,
      arrow_size: 10,
      beginId: beginNode.id,
      endId: endNode.id,
      lockMovementX: true,
      lockMovementY: true
    })

    beginNode.lines.push(arrow)
    endNode.lines.push(arrow)
    endNode.countInput++

    return arrow
  }

  renderAll() {
    let _ = this.canvas.getObjects()
    _.sort((obj1, obj2) => {
      if (obj1.level === obj2.level)
        return obj1.width * obj1.height < obj2.width * obj2.height
      return obj1.level > obj2.level
    })
    this.canvas.renderAll()
  }

  onEventListener(event = {}, handle) {
    this.eventListener(event, handle)
  }

  offEventListener(event) {
    this.eventListener(event)
  }

  eventListener(event, handle) {
    if (_.isNil(handle))
      this.canvas.off(event)
    else
      this.canvas.on(event, handle)
  }

  getPointer(event) {
    if (_.isNil(event)) return
    return this.canvas.getPointer(event)
  }

  getCanvas() {
    return this.canvas
  }

  lockMovement() {
    this.setAllMovementObjects(true)
  }

  unlockMovement() {
    this.setAllMovementObjects(false)    
  }

  setAllMovementObjects(isLock = false) {
    _.forEach(this.canvas.getObjects(), (val) => {
      if (val.type === 'node')
        val.set({'lockMovementX': isLock, 'lockMovementY': isLock})
    })
  }

  disableContextMenu() {
    this.contextMenu.stop()
  }

  enableContextMenu() {
    this.contextMenu.start()
  }

  disableMoveObject() {
    this.moveObject.stop()
  }

  enableMoveObject() {
    this.moveObject.start()
  }
}