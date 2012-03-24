-----------------------
-- NO: A game of numbers
-- Created: 23.08.08 by Michael Enger
-- Version: 0.2
-- Website: http://www.facemeandscream.com
-- Licence: ZLIB
-----------------------
-- States used.
-----------------------

-- Menu State
-- Main menu...
Menu = {}
Menu.__index = Menu

function Menu.create()
	local temp = {}
	setmetatable(temp, Menu)
	temp.button = {	new = Button.create("New Game", 400, 250),
					instructions = Button.create("Instructions", 400, 300),
					options = Button.create("Options", 400, 350),
					quit = Button.create("Quit", 400, 550) }
	return temp
end

function Menu:draw()

	love.graphics.draw(graphics["logo"], 400, 125, 0, 1, 1, 100, 75)
	
	for n,b in pairs(self.button) do
		b:draw()
	end

end

function Menu:update(dt)
	
	for n,b in pairs(self.button) do
		b:update(dt)
	end
	
end

function Menu:mousepressed(x,y,button)
	
	for n,b in pairs(self.button) do
		if b:mousepressed(x,y,button) then
			if n == "new" then
				state = Game.create()
			elseif n == "instructions" then
				state = Instructions.create()
			elseif n == "options" then
				state = Options.create()
			elseif n == "quit" then
				love.event.push("q")
			end
		end
	end
	
end

function Menu:keypressed(key)
	if key == " " then
		state = Game.create() -- start game with space
	end
	if key == "escape" then
		love.event.push("q")
	end
end


-- Instructions State
-- Shows the instructions
Instructions = {}
Instructions.__index = Instructions

function Instructions.create()
	local temp = {}
	setmetatable(temp, Instructions)
	temp.button = {	back = Button.create("Back", 400, 550) }
	return temp
end

function Instructions:draw()

	love.graphics.draw(graphics["logo"], 400, 125, 0, 1, 1, 100, 75)
	
	love.graphics.setColor(unpack(color["text"]))
	love.graphics.setFont(font["small"])
	love.graphics.printf("The point of this game is to fill out a standard, randomly generated, nonogram by using the mouse. The left mouse button fills in (or 'un-fills') an area whilst the right mouse button is used to set hints where you think an area shouldn't be filled.\nUse the escape key to pause the game.\n\nGood luck.", 100, 250, 600, "center")
	
	for n,b in pairs(self.button) do
		b:draw()
	end

end

function Instructions:update(dt)
	
	for n,b in pairs(self.button) do
		b:update(dt)
	end
	
end

function Instructions:mousepressed(x,y,button)
	
	for n,b in pairs(self.button) do
		if b:mousepressed(x,y,button) then
			if n == "back" then
				state = Menu.create()
			end
		end
	end
	
end

function Instructions:keypressed(key)
	
	if key == "escape" then
		state = Menu.create()
	end
	
end


-- Options State
-- Shows the options
Options = {}
Options.__index = Options

function Options.create()
	local temp = {}
	setmetatable(temp, Options)
	temp.button = {	on = Button.create("On", 425, 300),
					off = Button.create("Off", 550, 300),
					five = Button.create(" 5 ", 375, 375),
					six = Button.create(" 6 ", 425, 375),
					seven = Button.create(" 7 ", 475, 375),
					eight = Button.create(" 8 ", 525, 375),
					--nine = Button.create(" 9 ", 575, 375),
					back = Button.create("Back", 400, 550) }
	return temp
end

function Options:draw()

	love.graphics.draw(graphics["logo"], 400, 125, 0, 1, 1, 100, 75)
	
	love.graphics.setColor(unpack(color["text"]))
	love.graphics.setFont(font["large"])
	love.graphics.print("Audio:", 250, 270)
	love.graphics.print("Level:", 250, 345)
	
	love.graphics.setColor(unpack(color["main"]))
	love.graphics.setLine(4, "rough")
	
	if audio then
		love.graphics.line(400,305,450,305)
	else
		love.graphics.line(525,305,575,305)
	end
	
	love.graphics.line(360+((size-5)*50),380,390+((size-5)*50),380)
	
	for n,b in pairs(self.button) do
		b:draw()
	end

end

function Options:update(dt)
	
	for n,b in pairs(self.button) do
		b:update(dt)
	end
	
end

function Options:mousepressed(x,y,button)
	
	for n,b in pairs(self.button) do
		if b:mousepressed(x,y,button) then
			if n == "on" then
				audio = true
				love.audio.resume()
			elseif n == "off" then
				audio = false
				love.audio.pause()
			elseif n == "five" then
				size = 5
			elseif n == "six" then
				size = 6
			elseif n == "seven" then
				size = 7
			elseif n == "eight" then
				size = 8
			elseif n == "nine" then
				size = 9
			elseif n == "back" then
				state = Menu.create()
			end
		end
	end
	
end

function Options:keypressed(key)
	
	if key == "escape" then
		state = Menu.create()
	end
	
end


-- Game State
-- Where the actual playing takes place
Game = {}
Game.__index = Game

function Game.create()
	
	local temp = {}
	setmetatable(temp, Game)
	
	math.randomseed(os.time()) -- randomize (for good measure)
	
	-- Setup the randomized grid
	temp.grid = {}
	for x = 1,size do
		temp.grid[x] = {}
		for y = 1, size do
			num = math.random(1,3)
			if num == 1 then
				temp.grid[x][y] = false
			else
				temp.grid[x][y] = true
			end
		end
	end
	
	-- Create the text along the top
	local count = 0
	temp.horizontal = {}
	for x = 1,size do
		temp.horizontal[x] = ""
		for y = 1,size do
			if temp.grid[x][y] then
				count = count + 1
			elseif count ~= 0 then
				temp.horizontal[x] = temp.horizontal[x] .. count .. "\n"
				count = 0
			end
		end
		
		if count ~= 0 then
			temp.horizontal[x] = temp.horizontal[x] .. count .. "\n"
		end
		
		count = 0
	end
	
	-- Create the text along the side
	temp.vertical = {}
	for y = 1,size do
		temp.vertical[y] = ""
		for x = 1,size do
			if temp.grid[x][y] then
				count = count + 1
			elseif count ~= 0 then
				temp.vertical[y] = temp.vertical[y] .. count .. " "
				count = 0
			end
		end
		
		if count ~= 0 then
			temp.vertical[y] = temp.vertical[y] .. count .. " "
		end
		
		count = 0
	end
	
	-- Setup the user-entered grid
	temp.grid = {}
	for x = 1,size do
		temp.grid[x] = {}
		for y = 1, size do
			temp.grid[x][y] = 0
		end
	end
	
	-- Other variables
	temp.time = 0 -- the time for this game
	temp.win = -999 -- if the game is won and timer for fadein
	temp.pause = false -- if the game is paused
	temp.button = {	new = Button.create("New Game", 300, 400),
					resume = Button.create("Resume", 300, 400),
					quit = Button.create("Quit", 525, 400) }
	
	return temp
	
end

function Game:draw()
	
	local gs = size*50
	local gx = (love.graphics.getWidth() - gs) / 2
	local gy = (love.graphics.getHeight() - gs) / 2 + (size / 2 * 10)	
	local offset = 0
	
	-- Grid items
	for x=1,size do
		for y=1,size do
			if self.grid[x][y] == 1 then
				love.graphics.draw(graphics["set"], gx+(x*50)-25, gy+(y*50)-25, 0, 1, 1, 25, 25)
			elseif self.grid[x][y] == 2 then
				love.graphics.draw(graphics["notset"], gx+(x*50)-25, gy+(y*50)-25, 0, 1, 1, 25, 25)
			end
		end
	end
	
	-- The grid
	love.graphics.setColor(unpack(color["main"]))
	love.graphics.setLine(2, "rough")
	love.graphics.rectangle("line",gx,gy,gs,gs) -- surrounding rectangle
	love.graphics.setLine(1)
	for i=1,size do
		offset = offset + (gs/size)
		love.graphics.line(gx+offset, gy, gx+offset, gy+gs) -- vertical lines
		love.graphics.line(gx, gy+offset, gx+gs, gy+offset) -- horizontal lines
	end
	
	-- Text
	love.graphics.setColor(unpack(color["text"]))
	love.graphics.setFont(font["default"])
	for i=1,size do
		love.graphics.printf(self.horizontal[i],
					gx+(50*i)-50,
					gy-((string.len(self.horizontal[i])/2) * font["default"]:getHeight() * font["default"]:getLineHeight()),
					50, "center")
		love.graphics.printf(self.vertical[i], 0, gy+(50*i)-36, gx, "right")
	end
	
	-- Time (removed)
	--love.graphics.setColor(color["text"])
	--love.graphics.setFont(font["default"])
	--love.graphics.draw(string.format("%.2fs", self.time), 700, 40)
	
	if self.win ~= -999 then
		-- You won!
		if self.win > 0 then
			love.graphics.setColor(255,255,255,235-(235*(self.win/0.5)))
			love.graphics.rectangle("fill",0,0,love.graphics.getWidth(),love.graphics.getHeight())
		else
			love.graphics.setColor(unpack(color["overlay"]))
			love.graphics.rectangle("fill",0,0,love.graphics.getWidth(),love.graphics.getHeight())
			love.graphics.setColor(unpack(color["main"]))
			love.graphics.setFont(font["huge"])
			love.graphics.printf("CONGRATULATIONS", 0, 150, love.graphics.getWidth(), "center")
			love.graphics.setColor(unpack(color["text"]))
			love.graphics.setFont(font["default"])
			love.graphics.printf("You completed a level " .. size .. " puzzle in: \n" .. string.format("%.2f", self.time) .. " seconds", 0, 200+64, love.graphics.getWidth(), "center")
			-- Buttons
			self.button["new"]:draw()
			self.button["quit"]:draw()
		end
	elseif self.pause then
		love.graphics.setColor(unpack(color["overlay"]))
		love.graphics.rectangle("fill",0,0,love.graphics.getWidth(),love.graphics.getHeight())
		love.graphics.setColor(unpack(color["main"]))
		love.graphics.setFont(font["huge"])
		love.graphics.printf("PAUSED", 0, 150, love.graphics.getWidth(), "center")
		love.graphics.setColor(unpack(color["text"]))
		love.graphics.setFont(font["default"])
		-- Buttons
		self.button["resume"]:draw()
		self.button["quit"]:draw()
	else
	end
	
end

function Game:update(dt)
	
	if self.win ~= -999 then
		if self.win > 0 then
			self.win = self.win - dt
		end
		self.button["new"]:update(dt)
		self.button["quit"]:update(dt)
	elseif self.pause then
		self.button["resume"]:update(dt)
		self.button["quit"]:update(dt)
	else
		self.time = self.time + dt
	end
	
end

function Game:mousepressed(x, y, button)
	
	if self.win ~= -999 then
		if self.button["new"]:mousepressed(x, y, button) then
			state = Game.create()
		elseif self.button["quit"]:mousepressed(x, y, button) then
			state = Menu.create()
		end
	elseif self.pause then
		if self.button["resume"]:mousepressed(x, y, button) then
			self.pause = false
		elseif self.button["quit"]:mousepressed(x, y, button) then
			state = Menu.create()
		end
	else
		local gs = size*50
		local gx = (love.graphics.getWidth() - gs) / 2
		local gy = (love.graphics.getHeight() - gs) / 2 + (size / 2 * 10)
		-- Set the positions relative to the grid
		x = x - gx
		y = y - gy
		
		-- Is the mouse within the grid?
		if x > 0
			and x < gs
			and y > 0
			and y < gs then
			
			-- Get the cell they clicked in
			x = math.ceil(x / 50)
			y = math.ceil(y / 50)
			
			-- Make the change
			if button == "l" then
				if self.grid[x][y] == 1 then
					self.grid[x][y] = 0
				else
					self.grid[x][y] = 1
				end
				if audio then love.audio.play(sound["shush"]) end
			elseif button == "r" then
				if self.grid[x][y] == 2 then
					self.grid[x][y] = 0
				else
					self.grid[x][y] = 2
				end
				if audio then love.audio.play(sound["shush"]) end
			end
			
			-- Check if the new answer is correct
			if self:testSolution() then
				if audio then love.audio.play(sound["pling"]) end
				self.win = 0.5
			end
		end
		
	end
	
end

function Game:keypressed(key)
	
	if key == "escape" then
		if self.win ~= -999 then
			state = Menu.create()
		elseif self.pause then
			self.pause = false
		else
			self.pause = true
		end
	end
	
end

function Game:testSolution()

	local count = 0
	
	-- Make horizontal and vertical number lists for the entred solution
	th = {}
	for x = 1,size do
		th[x] = ""
		for y = 1,size do
			if self.grid[x][y] == 1 then
				count = count + 1
			elseif count ~= 0 then
				th[x] = th[x] .. count .. "\n"
				count = 0
			end
		end
		if count ~= 0 then
			th[x] = th[x] .. count .. "\n"
		end
		count = 0
	end
	tv = {}
	for y = 1,size do
		tv[y] = ""
		for x = 1,size do
			if self.grid[x][y] == 1 then
				count = count + 1
			elseif count ~= 0 then
				tv[y] = tv[y] .. count .. " "
				count = 0
			end
		end
		if count ~= 0 then
			tv[y] = tv[y] .. count .. " "
		end
		count = 0
	end
	
	-- Compare against real numbers, stopping where it fails
	for i=1,size do
		if self.horizontal[i] ~= th[i] or self.vertical[i] ~= tv[i] then
			return false
		end
	end
	
	return true -- default action

end
