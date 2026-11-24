extends Node2D

var score := 0
var speed := 250
var spawn_t := 0.0
var stars := []
var over := false

func _ready():
	$ScoreLabel.text = "0"

func _process(delta):
	if over:
		return
	var pad = $Pad
	var dir := 0.0
	if Input.is_action_pressed("ui_left"):
		dir -= 1.0
	if Input.is_action_pressed("ui_right"):
		dir += 1.0
	pad.position.x = clamp(pad.position.x + dir * 340.0 * delta, 10.0, 370.0)
	spawn_t += delta
	if spawn_t > 0.9:
		spawn_t = 0.0
		spawn_star()
	var cx = pad.position.x + 50.0
	var gone := []
	for s in stars:
		s.position.y += speed * delta
		if s.position.y > 700.0:
			gone.append(s)
			end_game()
		elif abs(s.position.x - cx) < 55.0 and abs(s.position.y - pad.position.y) < 30.0:
			score += 1
			$ScoreLabel.text = str(score)
			gone.append(s)
	for s in gone:
		stars.erase(s)
		s.queue_free()

func _input(event):
	if event is InputEventScreenTouch and event.pressed:
		$Pad.position.x = clamp(event.position.x, 10.0, 370.0)
	elif event is InputEventScreenDrag:
		$Pad.position.x = clamp(event.position.x, 10.0, 370.0)
	elif event is InputEventMouseButton and event.pressed and event.button_index == MOUSE_BUTTON_LEFT:
		$Pad.position.x = clamp(event.position.x, 10.0, 370.0)

func spawn_star():
	var star = ColorRect.new()
	star.size = Vector2(24, 24)
	star.color = Color(1, 0.85, 0.1, 1)
	star.position = Vector2(randf_range(30.0, 450.0), 0.0)
	add_child(star)
	stars.append(star)

func end_game():
	if over:
		return
	over = true
	$Title.text = "GAME OVER - " + str(score)
