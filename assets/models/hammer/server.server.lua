local debris = game:GetService("Debris")
local tool = script.Parent
local handle = tool.Handle

local DEBOUNCE_WAIT = 0.3

local function swingAnimation()
	local Anim = Instance.new("StringValue")
	Anim.Name = "toolanim"
	Anim.Value = "Slash"
	debris:AddItem(Anim, 2)
	Anim.Parent = tool
end

local function whack()
	if not tool.Enabled then
		return
	end

	tool.Enabled = false
	handle.CanTouch = true

	swingAnimation()

	handle.Touched:Connect(function(touched)
		local humanoid = touched.Parent:FindFirstChildWhichIsA("Humanoid")
		if humanoid then
			humanoid.Sit = true
		end
	end)

	task.wait(DEBOUNCE_WAIT)
	tool.Enabled = true
	handle.CanTouch = false
end

tool.Activated:Connect(whack)
