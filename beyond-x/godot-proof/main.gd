extends Node2D

var t := 0.0

func _process(delta):
	t += delta
	$Ball.position.x = 190 + sin(t * 1.5) * 140
	$Ball.position.y = 310 + cos(t) * 60
