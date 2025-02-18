package main

import (
	"bytes"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"runtime"
	"sync"
	"time"
	"encoding/json"
)

const numRequests = 10000
const needBalance = 10000

type BalanceResponse struct {
	Balance int `json:"balance"`
}

var client = &http.Client{
	Timeout: 10 * time.Second,
}

func main() {
	routes := []string{
		"http://localhost:3000/approach/transaction-pessimistic-locking/balance",
		"http://localhost:3000/approach/self/balance",
	}

	logFile, err := os.OpenFile("responses.log", os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		log.Fatalf("Ошибка при открытии файла для логирования: %v\n", err)
	}
	defer logFile.Close()
	fileLogger := log.New(logFile, "", log.LstdFlags)

	var mu sync.Mutex

	var wg sync.WaitGroup
	numCPU := runtime.NumCPU()
	sem := make(chan struct{}, numCPU)

	for _, url := range routes {
	    initialBalance := getBalance(url)
    	log.Printf("Начальный баланс: %d\n", initialBalance)
		setBalance(url, needBalance - initialBalance)

		responseCounts := make(map[string]int)

		for i := 0; i < numRequests; i++ {
			wg.Add(1)
			sem <- struct{}{}
			go func(requestNum int, route string) {
				defer wg.Done()
				defer func() { <-sem }()

				response, statusCode, err := sendPatchRequest(route, []byte(`{"userId":1,"amount":-2}`))
				if err != nil {
					log.Printf("(%d) Ошибка: %v", requestNum, err)
					return
				}

				output := fmt.Sprintf("(%d) Код статуса: %d, Результат: %s", requestNum, statusCode, response)
				log.Println(output)
				fileLogger.Println(output)

				mu.Lock()
				responseCounts[response]++
				mu.Unlock()
			}(i, url)
		}

        wg.Wait()
        log.Println("Количество повторяющихся ответов:")
        for resp, count := range responseCounts {
            if count > 1 {
                output := fmt.Sprintf("Ответ: %s, Количество: %d", resp, count)
               	log.Printf(output)
                fileLogger.Println(output)
            }
        }
	}

	log.Println("Все запросы отправлены и обработаны.")
}

func sendPatchRequest(url string, jsonBody []byte) (response string, statusCode int, err error) {
	req, err := http.NewRequest(http.MethodPatch, url, bytes.NewBuffer(jsonBody))
	if err != nil {
		return "", 0, fmt.Errorf("не удалось создать запрос: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := client.Do(req)
	if err != nil {
		return "", 0, fmt.Errorf("ошибка при отправке запроса: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", resp.StatusCode, fmt.Errorf("ошибка при чтении ответа: %w", err)
	}
	return string(body), resp.StatusCode, nil
}

func getBalance(url string) int {
	response, err := setBalance(url, 0)
	if err != nil {
		log.Printf("Ошибка при вызове setBalance для получения баланса: %v", err)
		return 0
	}

	var br BalanceResponse
	err = json.Unmarshal([]byte(response), &br)
	if err != nil {
		log.Printf("Ошибка при парсинге баланса из ответа '%s': %v", response, err)
		return 0
	}
	return br.Balance
}

func setBalance(url string, balance int) (string, error) {
	jsonData := fmt.Sprintf(`{"userId":1,"amount":%d}`, balance)
	req, err := http.NewRequest(http.MethodPatch, url, bytes.NewBuffer([]byte(jsonData)))
	if err != nil {
		log.Printf("Ошибка при создании запроса для обновления баланса: %v", err)
		return "", err
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := client.Do(req)
	if err != nil {
		log.Printf("Ошибка при отправке запроса для обновления баланса: %v", err)
		return "", err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		log.Printf("Ошибка при чтении ответа обновления баланса: %v", err)
		return "", err
	}
	log.Printf("Ответ сервера при обновлении баланса: %s", string(body))
	return string(body), nil
}
