package com.chatapp.userservice.service;

import com.chatapp.userservice.dto.UserProfileResponse;
import com.chatapp.userservice.entity.UserEntity;
import com.chatapp.userservice.repository.UserRepository;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional
    public UserProfileResponse getCurrentUserProfile(Jwt jwt) {
        String authUserId = required(jwt.getSubject(), "sub");

        UserEntity user = userRepository.findByAuthUserId(authUserId)
                .orElseGet(() -> userRepository.save(createUserFromJwt(jwt)));

        return toResponse(user);
    }

    private UserEntity createUserFromJwt(Jwt jwt) {
        String authUserId = required(jwt.getSubject(), "sub");
        String username = required(jwt.getClaimAsString("preferred_username"), "preferred_username");
        String email = required(jwt.getClaimAsString("email"), "email");
        String displayName = firstNonBlank(jwt.getClaimAsString("name"), username);
        String avatarUrl = jwt.getClaimAsString("picture");

        UserEntity user = new UserEntity();
        user.setAuthUserId(authUserId);
        user.setUsername(username);
        user.setEmail(email);
        user.setDisplayName(displayName);
        user.setAvatarUrl(avatarUrl);
        return user;
    }

    private UserProfileResponse toResponse(UserEntity user) {
        return new UserProfileResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getDisplayName(),
                user.getAvatarUrl()
        );
    }

    private String required(String value, String claimName) {
        if (value == null || value.isBlank()) {
            throw new IllegalStateException("Required JWT claim is missing: " + claimName);
        }
        return value;
    }

    private String firstNonBlank(String first, String fallback) {
        if (first != null && !first.isBlank()) {
            return first;
        }
        return fallback;
    }
}