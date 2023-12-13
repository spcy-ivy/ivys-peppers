local debris = game:GetService("Debris")
local tool = script.Parent
local handle = tool.Handle

local DEBOUNCE_WAIT = 0.3
local PUSH_FORCE = 100

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

		if not humanoid then
			return
		end

		local rootpart = touched.Parent.HumanoidRootPart
		local root_attachment = rootpart.RootAttachment

		local velocity = Instance.new("LinearVelocity")

		velocity.Attachment0 = root_attachment
		velocity.MaxForce = 5000
		velocity.VectorVelocity = handle.CFrame.LookVector * -PUSH_FORCE

		velocity.Parent = rootpart

		humanoid.Sit = true

		task.wait(0.1)
		velocity:Destroy()
	end)

	task.wait(DEBOUNCE_WAIT)
	tool.Enabled = true
	handle.CanTouch = false
end

tool.Activated:Connect(whack)
