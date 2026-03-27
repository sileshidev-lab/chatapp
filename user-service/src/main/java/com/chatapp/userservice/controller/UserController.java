package com.chatapp.userservice.controller;

import com.chatapp.userservice.dto.UserProfileResponse;
import com.chatapp.userservice.service.UserService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public UserProfileResponse getCurrentUserProfile(@AuthenticationPrincipal Jwt jwt) {
        return userService.getCurrentUserProfile(jwt);
    }
}
