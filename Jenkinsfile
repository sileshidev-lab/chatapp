pipeline {
    agent any

    stages {
        stage('Build Jars') {
            steps {
                dir('user-service') {
                    sh './mvnw -DskipTests package'
                }
                dir('chat-service') {
                    sh './mvnw -DskipTests package'
                }
                dir('notification-service') {
                    sh './mvnw -DskipTests package'
                }
            }
        }

        stage('Build Images') {
            steps {
                sh '''
                    IMAGE_TAG="$(printf '%s' "${GIT_COMMIT:-$BUILD_NUMBER}" | cut -c1-7)"
                    DOCKERHUB_NAMESPACE="${DOCKERHUB_NAMESPACE:-sileshidev-lab}"

                    echo "$IMAGE_TAG" > .image_tag
                    echo "$DOCKERHUB_NAMESPACE" > .dockerhub_namespace

                    docker build -t "${DOCKERHUB_NAMESPACE}/chatapp-user-service:${IMAGE_TAG}" user-service
                    docker build -t "${DOCKERHUB_NAMESPACE}/chatapp-chat-service:${IMAGE_TAG}" chat-service
                    docker build -t "${DOCKERHUB_NAMESPACE}/chatapp-notification-service:${IMAGE_TAG}" notification-service
                '''
            }
        }

        stage('Push Images') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub-credentials', usernameVariable: 'DOCKERHUB_USERNAME', passwordVariable: 'DOCKERHUB_PASSWORD')]) {
                    sh '''
                        IMAGE_TAG="$(cat .image_tag)"
                        DOCKERHUB_NAMESPACE="$(cat .dockerhub_namespace)"

                        echo "$DOCKERHUB_PASSWORD" | docker login -u "$DOCKERHUB_USERNAME" --password-stdin

                        docker push "${DOCKERHUB_NAMESPACE}/chatapp-user-service:${IMAGE_TAG}"
                        docker push "${DOCKERHUB_NAMESPACE}/chatapp-chat-service:${IMAGE_TAG}"
                        docker push "${DOCKERHUB_NAMESPACE}/chatapp-notification-service:${IMAGE_TAG}"

                        docker tag "${DOCKERHUB_NAMESPACE}/chatapp-user-service:${IMAGE_TAG}" "${DOCKERHUB_NAMESPACE}/chatapp-user-service:latest"
                        docker tag "${DOCKERHUB_NAMESPACE}/chatapp-chat-service:${IMAGE_TAG}" "${DOCKERHUB_NAMESPACE}/chatapp-chat-service:latest"
                        docker tag "${DOCKERHUB_NAMESPACE}/chatapp-notification-service:${IMAGE_TAG}" "${DOCKERHUB_NAMESPACE}/chatapp-notification-service:latest"

                        docker push "${DOCKERHUB_NAMESPACE}/chatapp-user-service:latest"
                        docker push "${DOCKERHUB_NAMESPACE}/chatapp-chat-service:latest"
                        docker push "${DOCKERHUB_NAMESPACE}/chatapp-notification-service:latest"
                    '''
                }
            }
        }
    }

    post {
        always {
            sh 'rm -f .image_tag .dockerhub_namespace'
            sh 'docker logout || true'
        }
    }
}
